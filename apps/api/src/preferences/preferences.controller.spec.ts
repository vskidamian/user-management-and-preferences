import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

const TEST_SECRET = 'test-secret';

const mockUser = {
  _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
  email: 'user@example.com',
  organizationId: 'bbbbbbbbbbbbbbbbbbbbbbbb',
  role: 'member',
};

const mockPrefsService = {
  findByUser: jest.fn().mockResolvedValue(null),
  upsert: jest.fn().mockResolvedValue({ theme: 'dark' }),
};

const mockUsersService = {
  findById: jest.fn().mockResolvedValue(mockUser),
};

const mockConfigService = {
  get: (key: string, fallback?: string) =>
    key === 'JWT_SECRET' ? TEST_SECRET : fallback,
};

describe('PreferencesController', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '1d' } }),
      ],
      controllers: [PreferencesController],
      providers: [
        JwtStrategy,
        JwtAuthGuard,
        { provide: PreferencesService, useValue: mockPrefsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    await app.init();

    jwtService = module.get(JwtService);
  });

  afterAll(() => app.close());

  beforeEach(() => jest.clearAllMocks());

  function validCookie() {
    const token = jwtService.sign({
      sub: mockUser._id,
      email: mockUser.email,
      organizationId: mockUser.organizationId,
      role: mockUser.role,
    });
    return `token=${token}`;
  }

  describe('GET /preferences', () => {
    it('returns 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/preferences').expect(401);
    });

    it('returns 401 when the token is invalid', () => {
      return request(app.getHttpServer())
        .get('/preferences')
        .set('Cookie', 'token=bad.token.value')
        .expect(401);
    });

    it('returns 200 and calls findByUser with the token owner id', async () => {
      await request(app.getHttpServer())
        .get('/preferences')
        .set('Cookie', validCookie())
        .expect(200);

      expect(mockPrefsService.findByUser).toHaveBeenCalledWith(mockUser._id);
    });
  });

  describe('PUT /preferences', () => {
    it('returns 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .put('/preferences')
        .send({ theme: 'dark' })
        .expect(401);
    });

    it('returns 200 and delegates to upsert with the correct user context', async () => {
      await request(app.getHttpServer())
        .put('/preferences')
        .set('Cookie', validCookie())
        .send({ theme: 'dark' })
        .expect(200);

      expect(mockPrefsService.upsert).toHaveBeenCalledWith(
        mockUser._id,
        mockUser.organizationId,
        expect.objectContaining({ theme: 'dark' }),
      );
    });
  });
});
