import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PreferenceDocument = Preference & Document;

@Schema({ timestamps: true })
export class Preference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ default: 'light', enum: ['light', 'dark'] })
  theme!: string;

  @Prop({ default: 'en' })
  language!: string;

  @Prop({ type: Map, of: String, default: {} })
  settings!: Map<string, string>;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
