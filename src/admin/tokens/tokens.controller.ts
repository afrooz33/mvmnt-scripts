import {
  Get,
  Body,
  Post,
  Query,
  Param,
  Patch,
  UsePipes,
  UseGuards,
  Controller,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { ValidationPipe } from '@app/src/shared/validations'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { TokensService } from './tokens.service'
import { QueryDto, UpdateWhitelistDto, CreateTokensDto } from './dto'
import { TokenWhitelistEntity } from './entities/whitelist-tokens.entity'

@ApiTags('Admin Tokens')
@Controller('admin/tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOkResponse({ type: TokenWhitelistEntity })
  @ApiOperation({ summary: 'Admin get single token' })
  @ApiNotFoundResponse(GetResponse('Token does not exist'))
  async showOne(@Param('id') id: string): Promise<TokenWhitelistEntity> {
    return this.tokensService.showOne(id)
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin get tokens' })
  @ApiNotFoundResponse(GetResponse('Tokens does not exist'))
  async show(@Query() query: QueryDto): Promise<PaginateRO> {
    return this.tokensService.show(query)
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin create tokens' })
  @ApiNotFoundResponse(GetResponse('Tokens does not exist'))
  async create(@Body() payload: CreateTokensDto): Promise<SuccessRO> {
    return this.tokensService.create(payload)
  }

  @Patch()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin update whitelisted tokens' })
  @ApiNotFoundResponse(GetResponse('Tokens does not exist'))
  async updateWhitelist(@Body() payload: UpdateWhitelistDto): Promise<SuccessRO> {
    return this.tokensService.updateWhitelist(payload)
  }
}
