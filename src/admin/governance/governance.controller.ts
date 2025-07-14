import { Controller, Put, Get, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger'
import { GovernanceService } from './governance.service'
import { AdminJwtAuthGuard } from '@app/src/shared/auth/guards/admin-jwt-auth.guard'
import { AdminRolesGuard } from '@app/src/shared/auth/guards/admin-roles.guard'
import { Roles } from '@app/src/shared/auth/decorators/roles.decorator'
import { Role } from '@app/src/shared/enums/role.enum'
import {
  TransactionResponse,
  GovernanceParamsResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import {
  TransactionResponseDto,
  GovernanceParamsResponseDto,
  GovernanceParamsDto,
  UpdateBTManagerDto,
} from '@app/src/blockchain/dto/responses.dto'

@ApiTags('Admin - Governance')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
@Controller('admin/governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Put('brands/:brandId/params')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Set governance parameters for a brand' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async setGovernanceParams(
    @Param('brandId') brandId: string,
    @Body() payload: GovernanceParamsDto,
  ): Promise<TransactionResponse> {
    return this.governanceService.setGovernanceParams(brandId, payload)
  }

  @Get('brands/:brandId/params')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get governance parameters for a brand' })
  @ApiResponse({ status: 200, type: GovernanceParamsResponseDto })
  async getGovernanceParams(@Param('brandId') brandId: string): Promise<GovernanceParamsResponse> {
    return this.governanceService.getGovernanceParams(brandId)
  }

  @Put(':operation')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Pause/Unpause governance operations' })
  @ApiParam({ name: 'operation', enum: ['pause', 'unpause'], description: 'Operation to perform' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async toggleGovernance(
    @Param('operation') operation: 'pause' | 'unpause',
    @Body('userWalletAddress') userWalletAddress?: string,
  ): Promise<TransactionResponse> {
    if (operation === 'pause') {
      return this.governanceService.pause(userWalletAddress)
    }
    return this.governanceService.unpause(userWalletAddress)
  }

  @Get('paused')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Check if governance is paused' })
  @ApiResponse({ status: 200, type: Object })
  async isPaused(): Promise<{ isPaused: boolean }> {
    return this.governanceService.isPaused()
  }

  @Put('brand-token-manager')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update Brand Token Manager address' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async updateBTManager(
    @Body() updateBTManagerDto: UpdateBTManagerDto,
  ): Promise<TransactionResponse> {
    return this.governanceService.updateBTManager(updateBTManagerDto)
  }
}
