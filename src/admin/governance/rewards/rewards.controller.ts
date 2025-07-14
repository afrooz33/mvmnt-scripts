import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
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
import { RewardsService } from './rewards.service'
import { AdminJwtAuthGuard } from '@app/src/shared/auth/guards/admin-jwt-auth.guard'
import { AdminRolesGuard } from '@app/src/shared/auth/guards/admin-roles.guard'
import { Roles } from '@app/src/shared/auth/decorators/roles.decorator'
import { Role } from '@app/src/shared/enums/role.enum'
import { ErrorKey } from '@app/src/shared/enums'
import {
  TransactionResponse,
  RewardConditionResponse,
  ConditionValidationResponse,
  AutomaticRewardResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import {
  TransactionResponseDto,
  CreateConditionDto,
  EditConditionDto,
  ConditionScheduleDto,
  ValidateConditionDto,
  ProcessAutomaticDto,
} from '@app/src/blockchain/dto/responses.dto'

@ApiTags('Admin - Governance - Rewards')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
@Controller('admin/governance/rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // Commented out by request: createRewardCondition
  // @Post('conditions')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Create a new reward condition' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async createRewardCondition(
  //   @Body() conditionDto: CreateConditionDto,
  // ): Promise<TransactionResponse> {
  //   return this.rewardsService.createRewardCondition(conditionDto)
  // }

  // Commented out by request: editRewardCondition
  // @Put('conditions/:conditionId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Edit an existing reward condition' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async editRewardCondition(
  //   @Param('conditionId') conditionId: string,
  //   @Body() editConditionDto: EditConditionDto,
  // ): Promise<TransactionResponse> {
  //   return this.rewardsService.editRewardCondition(conditionId, editConditionDto)
  // }

  // Commented out by request: setConditionSchedule
  // @Put('conditions/:conditionId/schedule')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Set schedule for a reward condition' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async setConditionSchedule(
  //   @Param('conditionId') conditionId: string,
  //   @Body() scheduleDto: ConditionScheduleDto,
  // ): Promise<TransactionResponse> {
  //   return this.rewardsService.setConditionSchedule(conditionId, scheduleDto)
  // }

  // Commented out by request: getRewardConditions
  // @Get('conditions/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get all reward conditions for a brand' })
  // @ApiResponse({ status: 200, type: Object })
  // async getRewardConditions(@Param('brandId') brandId: string): Promise<RewardConditionResponse[]> {
  //   return this.rewardsService.getRewardConditions(brandId)
  // }

  // Commented out by request: validateCondition
  // @Post('conditions/:conditionId/validate')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Validate if a user meets a reward condition' })
  // @ApiResponse({ status: 200, type: Object })
  // async validateCondition(
  //   @Param('conditionId') conditionId: string,
  //   @Body() validateDto: ValidateConditionDto,
  // ): Promise<ConditionValidationResponse> {
  //   return this.rewardsService.validateCondition(conditionId, validateDto)
  // }

  // Commented out by request: processAutomaticRewards
  // @Post('automatic/process')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Process automatic rewards for eligible users' })
  // @ApiResponse({ status: 200, type: Object })
  // async processAutomaticRewards(
  //   @Body() processDto: ProcessAutomaticDto,
  // ): Promise<AutomaticRewardResponse> {
  //   return this.rewardsService.processAutomaticRewards(processDto)
  // }

  // Commented out by request: getAvailableTokensForRewards
  // @Get('available-tokens/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get available tokens for rewards' })
  // @ApiResponse({ status: 200, type: Object })
  // async getAvailableTokensForRewards(
  //   @Param('brandId') brandId: string,
  // ): Promise<{ availableTokens: string; totalAllocated: string }> {
  //   return this.rewardsService.getAvailableTokensForRewards(brandId)
  // }
}
