import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger'
import { AllocationService } from './allocation.service'
import { AdminJwtAuthGuard } from '@app/src/shared/auth/guards/admin-jwt-auth.guard'
import { AdminRolesGuard } from '@app/src/shared/auth/guards/admin-roles.guard'
import { Roles } from '@app/src/shared/auth/decorators/roles.decorator'
import { Role } from '@app/src/shared/enums/role.enum'
import {
  TransactionResponse,
  TokenAllocationSummaryResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import { TransactionResponseDto, TokenAllocationDto } from '@app/src/blockchain/dto/responses.dto'

@ApiTags('Admin - Governance - Allocation')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
@Controller('admin/governance/allocation')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  // Commented out by request: allocateTokens
  // @Post()
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Allocate tokens for a specific purpose' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async allocateTokens(@Body() allocationDto: TokenAllocationDto): Promise<TransactionResponse> {
  //   return this.allocationService.allocateTokens(allocationDto)
  // }

  // Commented out by request: allocateTokensForRewards
  // @Post('rewards/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Allocate tokens specifically for rewards' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async allocateTokensForRewards(
  //   @Param('brandId') brandId: string,
  //   @Body() allocationDto: TokenAllocationDto,
  // ): Promise<TransactionResponse> {
  //   return this.allocationService.allocateTokensForRewards(brandId, allocationDto)
  // }

  // Commented out by request: getTokenAllocationSummary
  // @Get('summary/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get token allocation summary for a brand' })
  // @ApiResponse({ status: 200, type: Object })
  // async getTokenAllocationSummary(
  //   @Param('brandId') brandId: string,
  // ): Promise<TokenAllocationSummaryResponse> {
  //   return this.allocationService.getTokenAllocationSummary(brandId)
  // }
}
