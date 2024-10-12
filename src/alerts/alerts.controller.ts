import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { AlertService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto } from './dtos';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiBody({ type: CreateAlertDto })
  @ApiResponse({ status: 201, description: 'Alert created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    return await this.alertService.createAlert(createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  @ApiResponse({
    status: 200,
    description: 'List of alerts retrieved successfully.',
  })
  async getAlerts() {
    return this.alertService.getAlerts();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active alerts' })
  @ApiResponse({
    status: 200,
    description: 'List of active alerts retrieved successfully.',
  })
  async getActiveAlerts() {
    return this.alertService.getActiveAlerts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alert by ID' })
  @ApiResponse({
    status: 200,
    description: 'The alert has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async getAlert(@Param('id') id: string) {
    const alert = await this.alertService.getAlertById(+id);
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found.`);
    }
    return alert;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an alert by ID' })
  @ApiBody({ type: UpdateAlertDto })
  @ApiResponse({ status: 200, description: 'Alert updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    return this.alertService.updateAlert(+id, updateAlertDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert by ID' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async deleteAlert(@Param('id') id: string) {
    return this.alertService.deleteAlert(+id);
  }
}
