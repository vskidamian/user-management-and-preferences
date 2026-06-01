import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, ValidateNested } from 'class-validator';

const VALID_COLUMNS = ['firstName', 'lastName', 'email', 'role'];
const VALID_SORTS = ['firstName', 'lastName', 'email'];

class TablePreferencesDto {
  @IsArray()
  @IsIn(VALID_COLUMNS, { each: true })
  visibleColumns!: string[];

  @IsIn(VALID_SORTS)
  defaultSort!: string;
}

export class UpsertPreferenceDto {
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TablePreferencesDto)
  tablePreferences?: TablePreferencesDto;
}
