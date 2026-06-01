import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schema';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  async create(name: string): Promise<OrganizationDocument> {
    return this.orgModel.create({ name });
  }

  async findById(id: string): Promise<OrganizationDocument | null> {
    return this.orgModel.findById(id).exec();
  }

  async findAll(): Promise<OrganizationDocument[]> {
    return this.orgModel.find({ isActive: true }).exec();
  }
}
