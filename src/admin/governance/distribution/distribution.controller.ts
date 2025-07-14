import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { DistributionService } from './distribution.service'
import { AdminJwtAuthGuard } from '@app/src/shared/auth/guards/admin-jwt-auth.guard'
import { AdminRolesGuard } from '@app/src/shared/auth/guards/admin-roles.guard'
import { Roles } from '@app/src/shared/auth/decorators/roles.decorator'
import { Role } from '@app/src/shared/enums/role.enum'
import { ErrorKey } from '@app/src/shared/enums'
import {
  TransactionResponse,
  DistributionHistoryResponse,
  DistributionRecipientsResponse,
  DistributionCampaignResponse,
  CampaignStatisticsResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import {
  TransactionResponseDto,
  ManualDistributionDto,
  CSVUploadDto,
  CSVDistributionDto,
  CreateCampaignDto,
  CloseCampaignDto,
  UpdateCampaignDto,
  DeleteCampaignDto,
} from '@app/src/blockchain/dto/responses.dto'

@ApiTags('Admin - Governance - Distribution')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
@Controller('admin/governance/distribution')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  // Commented out by request: distributeTokensManually
  // @Post('manual')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Distribute tokens manually to recipients' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async distributeTokensManually(
  //   @Body() manualDistributionDto: ManualDistributionDto,
  // ): Promise<TransactionResponse> {
  //   return this.distributionService.distributeTokensManually(manualDistributionDto)
  // }

  // Commented out by request: uploadDistributionCSV
  // @Post('csv/upload')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Upload and validate CSV data for distribution' })
  // @ApiResponse({ status: 200, type: Object })
  // async uploadDistributionCSV(@Body() csvUploadDto: CSVUploadDto): Promise<{
  //   success: boolean
  //   validRecords: number
  //   invalidRecords: number
  //   previewData: any[]
  // }> {
  //   return this.distributionService.uploadDistributionCSV(csvUploadDto)
  // }

  // Commented out by request: executeCSVDistribution
  // @Post('csv/execute')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Execute bulk distribution from validated CSV data' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async executeCSVDistribution(
  //   @Body() csvDistributionDto: CSVDistributionDto,
  // ): Promise<TransactionResponse> {
  //   return this.distributionService.executeCSVDistribution(csvDistributionDto)
  // }

  // Commented out by request: getDistributionHistory
  // @Get('history/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({
  //   summary: 'Get distribution history for a brand',
  //   description: 'Returns paginated list of all distributions for a specific brand',
  // })
  // @ApiParam({ name: 'brandId', description: 'Brand ID' })
  // @ApiQuery({
  //   name: 'page',
  //   description: 'Page number (default: 1)',
  //   required: false,
  //   type: Number,
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   description: 'Items per page (default: 10, max: 100)',
  //   required: false,
  //   type: Number,
  // })
  // @ApiResponse({ status: 200, type: Object })
  // async getDistributionHistory(
  //   @Param('brandId') brandId: string,
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ): Promise<DistributionHistoryResponse> {
  //   // Validate pagination parameters
  //   if (page < 1) {
  //     throw new BadRequestException(ErrorKey.INVALID_OPTION)
  //   }
  //   if (limit < 1 || limit > 100) {
  //     throw new BadRequestException(ErrorKey.INVALID_OPTION)
  //   }

  //   return this.distributionService.getDistributionHistory(brandId, page, limit)
  // }

  // Commented out by request: getDistributionRecipients
  // @Get('recipients/:distributionId')
  // @Roles(Role.OWNER)
  // @ApiOperation({
  //   summary: 'Get recipients for a specific distribution',
  //   description: 'Returns paginated list of all recipients for a specific distribution',
  // })
  // @ApiParam({ name: 'distributionId', description: 'Distribution ID' })
  // @ApiQuery({
  //   name: 'page',
  //   description: 'Page number (default: 1)',
  //   required: false,
  //   type: Number,
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   description: 'Items per page (default: 10, max: 100)',
  //   required: false,
  //   type: Number,
  // })
  // @ApiResponse({ status: 200, type: Object })
  // async getDistributionRecipients(
  //   @Param('distributionId') distributionId: string,
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ): Promise<DistributionRecipientsResponse> {
  //   // Validate pagination parameters
  //   if (page < 1) {
  //     throw new BadRequestException(ErrorKey.INVALID_OPTION)
  //   }
  //   if (limit < 1 || limit > 100) {
  //     throw new BadRequestException(ErrorKey.INVALID_OPTION)
  //   }

  //   return this.distributionService.getDistributionRecipients(distributionId, page, limit)
  // }

  // Commented out by request: createDistributionCampaign
  // @Post('campaigns')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Create a new distribution campaign' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async createDistributionCampaign(
  //   @Body() campaignDto: CreateCampaignDto,
  // ): Promise<TransactionResponse> {
  //   return this.distributionService.createDistributionCampaign(campaignDto)
  // }

  // Commented out by request: getDistributionCampaigns
  // @Get('campaigns/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get all distribution campaigns for a brand' })
  // @ApiResponse({ status: 200, type: Object })
  // async getDistributionCampaigns(
  //   @Param('brandId') brandId: string,
  // ): Promise<DistributionCampaignResponse[]> {
  //   return this.distributionService.getDistributionCampaigns(brandId)
  // }

  // Commented out by request: getCampaignById
  // @Get('campaigns/:campaignId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get a specific distribution campaign by ID' })
  // @ApiResponse({ status: 200, type: Object })
  // async getCampaignById(
  //   @Param('campaignId') campaignId: string,
  // ): Promise<DistributionCampaignResponse> {
  //   return this.distributionService.getCampaignById(campaignId)
  // }

  // Commented out by request: closeCampaign
  // @Put('campaigns/:campaignId/close')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Close a distribution campaign' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async closeCampaign(
  //   @Param('campaignId') campaignId: string,
  //   @Body() closeDto: CloseCampaignDto,
  // ): Promise<TransactionResponse> {
  //   return this.distributionService.closeCampaign(campaignId, closeDto)
  // }

  // Commented out by request: updateCampaign
  // @Put('campaigns/:campaignId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Update a distribution campaign' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async updateCampaign(
  //   @Param('campaignId') campaignId: string,
  //   @Body() updateDto: UpdateCampaignDto,
  // ): Promise<TransactionResponse> {
  //   return this.distributionService.updateCampaign(campaignId, updateDto)
  // }

  // Commented out by request: deleteCampaign
  // @Delete('campaigns/:campaignId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Delete a distribution campaign' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async deleteCampaign(
  //   @Param('campaignId') campaignId: string,
  //   @Body() deleteDto: DeleteCampaignDto,
  // ): Promise<TransactionResponse> {
  //   return this.distributionService.deleteCampaign(campaignId, deleteDto)
  // }

  // Commented out by request: getCampaignStatistics
  // @Get('campaigns/:campaignId/statistics')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get campaign statistics and performance' })
  // @ApiResponse({ status: 200, type: Object })
  // async getCampaignStatistics(
  //   @Param('campaignId') campaignId: string,
  // ): Promise<CampaignStatisticsResponse> {
  //   return this.distributionService.getCampaignStatistics(campaignId)
  // }
}
