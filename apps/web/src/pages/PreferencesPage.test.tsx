import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import { PreferencesPage } from "./PreferencesPage";

vi.mock("../api", () => ({
  getPreferences: vi.fn(),
  updatePreferences: vi.fn(),
}));

import { getPreferences, updatePreferences, type Preference } from "../api";

const SAVED_PREF: Preference = {
  _id: "pref-1",
  theme: "light",
  tablePreferences: {
    visibleColumns: ["firstName", "lastName", "email", "role"],
    defaultSort: "firstName",
  },
  updatedAt: "2026-01-01T10:00:00.000Z",
};

const UPDATED_PREF: Preference = {
  ...SAVED_PREF,
  theme: "dark",
  updatedAt: "2026-06-02T12:00:00.000Z",
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    );
  };
}

async function renderAndWaitForLoad() {
  render(<PreferencesPage />, { wrapper: makeWrapper() });
  // "Last saved …" appears only after preferences load and the form resets
  await screen.findByText(/last saved/i);
}

describe("PreferencesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(getPreferences).mockResolvedValue(SAVED_PREF);
    vi.mocked(updatePreferences).mockResolvedValue(UPDATED_PREF);
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  // ---------------------------------------------------------------------------
  // Save button state
  // ---------------------------------------------------------------------------

  describe("Save button", () => {
    it("is disabled when the form is pristine", async () => {
      await renderAndWaitForLoad();
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("becomes enabled after a field is changed", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    });

    it('shows "Saving…" and is disabled while the request is in progress', async () => {
      let resolve!: (v: typeof UPDATED_PREF) => void;
      vi.mocked(updatePreferences).mockReturnValue(
        new Promise((res) => {
          resolve = res;
        }),
      );

      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();

      // Resolve the pending promise and wait for React to finish updating
      resolve(UPDATED_PREF);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Save" })).toBeDisabled(),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Save action
  // ---------------------------------------------------------------------------

  describe("Save action", () => {
    it("calls updatePreferences with the current form values", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() =>
        expect(updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ theme: "dark" }),
          expect.anything(),
        ),
      );
    });

    it("resets the form to pristine (Save becomes disabled again)", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Save" })).toBeDisabled(),
      );
    });

    it('"Last saved at" reflects the timestamp returned by the server', async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      // Server returned updatedAt: '2026-06-02T…' — the year 2026 must appear
      await waitFor(() =>
        expect(screen.getByText(/last saved/i).textContent).toMatch(/2026/),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Reset button state
  // ---------------------------------------------------------------------------

  describe("Reset button", () => {
    it("is disabled when the form is pristine", async () => {
      await renderAndWaitForLoad();
      expect(screen.getByRole("button", { name: /reset/i })).toBeDisabled();
    });

    it("becomes enabled after a field is changed", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      expect(screen.getByRole("button", { name: /reset/i })).toBeEnabled();
    });
  });

  // ---------------------------------------------------------------------------
  // Reset action
  // ---------------------------------------------------------------------------

  describe("Reset action", () => {
    it("reverts unsaved theme change back to the last saved value", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();

      await user.click(screen.getByRole("radio", { name: /dark/i }));
      expect(screen.getByRole("radio", { name: /dark/i })).toBeChecked();

      await user.click(screen.getByRole("button", { name: /reset/i }));
      expect(screen.getByRole("radio", { name: /light/i })).toBeChecked();
    });

    it("reverts an unchecked visible-column back to saved state", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();

      const roleCheckbox = screen.getByRole("checkbox", { name: /role/i });
      expect(roleCheckbox).toBeChecked();

      await user.click(roleCheckbox);
      expect(roleCheckbox).not.toBeChecked();

      await user.click(screen.getByRole("button", { name: /reset/i }));
      expect(roleCheckbox).toBeChecked();
    });

    it("makes the form pristine so Save is disabled again", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: /reset/i }));

      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  // ---------------------------------------------------------------------------
  // "Unsaved changes" indicator
  // ---------------------------------------------------------------------------

  describe('"Unsaved changes" indicator', () => {
    it("is not visible when the form is pristine", async () => {
      await renderAndWaitForLoad();
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });

    it("appears when the form is dirty", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });

    it("disappears after a successful save", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() =>
        expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument(),
      );
    });

    it("disappears after a reset", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: /reset/i }));

      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Theme DOM application
  // ---------------------------------------------------------------------------

  describe("Theme DOM application", () => {
    it("applies the saved theme class to <html> on initial load", async () => {
      vi.mocked(getPreferences).mockResolvedValue({ ...SAVED_PREF, theme: "dark" });
      render(<PreferencesPage />, { wrapper: makeWrapper() });
      await screen.findByText(/last saved/i);

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("does not apply dark class when radio is changed before saving", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("applies dark class to <html> after saving dark theme", async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();
      await user.click(screen.getByRole("radio", { name: /dark/i }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() =>
        expect(document.documentElement.classList.contains("dark")).toBe(true),
      );
    });
  });
});
