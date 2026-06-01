import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(
    dto: CreateUserDto,
    organizationId: Types.ObjectId,
    role: 'admin' | 'member' = 'member',
  ): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.userModel.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role,
      organizationId,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAllInOrg(organizationId: string): Promise<UserDocument[]> {
    return this.userModel.find({ organizationId, isActive: true }).exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
    const update: Partial<User> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
    };

    if (dto.password) {
      (update as any).passwordHash = await bcrypt.hash(dto.password, 12);
    }

    return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
  }
}
