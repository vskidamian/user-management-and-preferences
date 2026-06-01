import { IsOptional, IsString, IsObject, IsIn } from 'class-validator';

export class UpsertPreferenceDto {
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, string>;
}
