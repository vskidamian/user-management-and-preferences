import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpsertPreferenceDto } from './dto/upsert-preference.dto';

@UseGuards(JwtAuthGuard)
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly prefsService: PreferencesService) {}

  @Get()
  getMyPreferences(@Request() req: any) {
    return this.prefsService.findByUser(req.user.userId);
  }

  @Put()
  upsertMyPreferences(@Request() req: any, @Body() dto: UpsertPreferenceDto) {
    return this.prefsService.upsert(
      req.user.userId,
      req.user.organizationId,
      dto,
    );
  }
}
