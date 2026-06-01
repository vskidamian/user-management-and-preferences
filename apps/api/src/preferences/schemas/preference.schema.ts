import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PreferenceDocument = Preference & Document;

const VALID_COLUMNS = ['firstName', 'lastName', 'email', 'role'] as const;
const VALID_SORTS = ['firstName', 'lastName', 'email'] as const;

@Schema({ _id: false })
class TablePreferences {
  @Prop({ type: [String], enum: VALID_COLUMNS, default: [...VALID_COLUMNS] })
  visibleColumns!: string[];

  @Prop({ enum: VALID_SORTS, default: 'firstName' })
  defaultSort!: string;
}

const TablePreferencesSchema = SchemaFactory.createForClass(TablePreferences);

@Schema({ timestamps: true })
export class Preference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ default: 'light', enum: ['light', 'dark'] })
  theme!: string;

  @Prop({ type: TablePreferencesSchema, default: () => ({}) })
  tablePreferences!: TablePreferences;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
