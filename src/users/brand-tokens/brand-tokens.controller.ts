import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConsumes,
} from '@nestjs/swagger'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { User } from '@app/src/shared/auth/decorators'
import { BrandTokensService } from '@app/src/users/brand-tokens/brand-tokens.service'
import {
  BrandTokenDetailsDto,
  InitialOfferingDto,
  CreateOfferingPhaseDto,
  SearchUsersDto,
  AddWhitelistDto,
  PurchaseTokensDto,
} from '@app/src/brand-tokens/dto'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'

@ApiTags('Brand Tokens')
@Controller('brand-tokens')
export class BrandTokensController {
  constructor(private readonly brandTokensService: BrandTokensService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit request for brand token issuance' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async createRequest(@User('id') userId: string): Promise<SuccessRO> {
    return this.brandTokensService.createBTRequest(userId)
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's brand token requests" })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async getRequests(@User('id') userId: string): Promise<PaginateRO> {
    return this.brandTokensService.showBTRequest(userId)
  }

  @Post('details/:brandId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update brand token details' })
  async createDetails(
    @User('id') userId: string,
    @Param('brandId') brandId: string,
    @Body() payload: BrandTokenDetailsDto,
  ): Promise<SuccessRO> {
    return this.brandTokensService.createDetails(userId, brandId, payload)
  }

  @Post(':brandId/token-offering')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new token offering' })
  async createTokenOffering(
    @User('id') userId: string,
    @Param('brandId') brandId: string,
    @Body() payload: InitialOfferingDto,
  ): Promise<SuccessRO> {
    return this.brandTokensService.createOffering(userId, brandId, payload)
  }

  @Get(':brandId/offerings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get brand token offerings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async getOfferings(
    @Param('brandId') brandId: string,
    @Query(new ValidationPipe({ transform: true })) query: MyPaginateDto,
  ): Promise<PaginateRO> {
    return this.brandTokensService.showOfferings(brandId, query)
  }

  @Post(':brandId/offerings/:offeringId/phases')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new phase for a brand token offering' })
  async createPhase(
    @Param('brandId') brandId: string,
    @Param('offeringId') offeringId: string,
    @Body() payload: CreateOfferingPhaseDto,
  ): Promise<SuccessRO> {
    return this.brandTokensService.createPhase(brandId, offeringId, payload)
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users for whitelist' })
  async searchUsers(@Query() query: SearchUsersDto): Promise<PaginateRO> {
    return this.brandTokensService.searchUsers(query)
  }

  @Post('phases/:phaseId/add-whitelist')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('csv_file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add users to phase whitelist' })
  async addToWhitelist(
    @User('id') userId: string,
    @Param('phaseId') phaseId: string,
    @Body() payload: AddWhitelistDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessRO> {
    return this.brandTokensService.addToWhitelist(userId, phaseId, payload, file)
  }

  @Post('phases/:phaseId/purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase tokens in a phase' })
  async purchaseTokens(
    @User('id') userId: string,
    @Param('phaseId') phaseId: string,
    @Body() payload: PurchaseTokensDto,
  ): Promise<SuccessRO> {
    return this.brandTokensService.purchaseTokens(userId, phaseId, payload)
  }

  @Get('phases/show/:phaseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get phase details' })
  async show(@Param('phaseId') phaseId: string): Promise<any> {
    return this.brandTokensService.getPhaseDetails(phaseId)
  }

  @Get('phases/:phaseId/whitelist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get phase whitelist' })
  async getPhaseWhitelist(@Param('phaseId') phaseId: string): Promise<PaginateRO> {
    return this.brandTokensService.getPhaseWhitelist(phaseId)
  }

  @Get('phases/:phaseId/participants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get phase participants' })
  async getPhaseParticipants(@Param('phaseId') phaseId: string): Promise<PaginateRO> {
    return this.brandTokensService.getPhaseParticipants(phaseId)
  }

  @Get('user/participations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user participations' })
  async getUserParticipations(@User('id') userId: string): Promise<PaginateRO> {
    return this.brandTokensService.getUserParticipations(userId)
  }

  @Post('phases/:phaseId/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim tokens from phase' })
  async claimTokens(
    @User('id') userId: string,
    @Param('phaseId') phaseId: string,
  ): Promise<SuccessRO> {
    return this.brandTokensService.claimTokens(userId, phaseId)
  }
}
