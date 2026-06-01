import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly orgsService: OrganizationsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const org = await this.orgsService.create(dto.organizationName);
    const user = await this.usersService.create(
      {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      org._id as Types.ObjectId,
      'admin',
    );
    return this.buildToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildToken(user);
  }

  async me(userId: string) {
    return this.usersService.findById(userId);
  }

  private buildToken(user: UserDocument) {
    const payload = {
      sub: (user._id as Types.ObjectId).toString(),
      email: user.email,
      organizationId: user.organizationId.toString(),
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      userId: payload.sub,
      organizationId: payload.organizationId,
      role: payload.role,
    };
  }
}
