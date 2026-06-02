import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ROUTES } from './lib/routes';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MembersPage } from './pages/MembersPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path={ROUTES.members} element={<MembersPage />} />
            <Route path={ROUTES.preferences} element={<PreferencesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.members} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
