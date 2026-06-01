import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Preference, PreferenceDocument } from './schemas/preference.schema';
import { UpsertPreferenceDto } from './dto/upsert-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectModel(Preference.name)
    private readonly prefModel: Model<PreferenceDocument>,
  ) {}

  async upsert(
    userId: string,
    organizationId: string,
    dto: UpsertPreferenceDto,
  ): Promise<PreferenceDocument> {
    return this.prefModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $set: {
            organizationId: new Types.ObjectId(organizationId),
            ...dto,
          },
        },
        { upsert: true, new: true },
      )
      .exec() as Promise<PreferenceDocument>;
  }

  async findByUser(userId: string): Promise<PreferenceDocument | null> {
    return this.prefModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
  }
}
