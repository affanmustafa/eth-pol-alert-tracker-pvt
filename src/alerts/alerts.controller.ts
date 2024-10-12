import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto } from './dtos';

@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Post()
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    const alert = await this.alertsService.createAlert(createAlertDto);
    return { message: 'Alert created successfully', alert };
  }

  @Get()
  async getAlerts() {
    return this.alertsService.getAlerts();
  }

  @Get(':id')
  async getAlert(@Param('id') id: string) {
    return this.alertsService.getAlertById(+id);
  }

  @Patch(':id')
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    return this.alertsService.updateAlert(+id, updateAlertDto);
  }

  @Delete(':id')
  async deleteAlert(@Param('id') id: string) {
    return this.alertsService.deleteAlert(+id);
  }
}
