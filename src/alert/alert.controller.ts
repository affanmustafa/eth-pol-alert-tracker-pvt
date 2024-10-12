import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto, UpdateAlertDto } from './dtos';

@Controller('alerts')
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Post()
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    const alert = await this.alertService.createAlert(createAlertDto);
    return { message: 'Alert created successfully', alert };
  }

  @Get()
  async getAlerts() {
    return this.alertService.getAlerts();
  }

  @Get(':id')
  async getAlert(@Param('id') id: string) {
    return this.alertService.getAlertById(+id);
  }

  @Patch(':id')
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    return this.alertService.updateAlert(+id, updateAlertDto);
  }

  @Delete(':id')
  async deleteAlert(@Param('id') id: string) {
    return this.alertService.deleteAlert(+id);
  }
}
