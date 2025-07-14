import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  ValidationPipe,
  Put,
  UsePipes,
} from '@nestjs/common'
import { LanguagesService } from './languages.service'
import { CreateLanguageDto, UpdateLanguageDto, QueryDto } from './dto'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { Roles } from '@app/src/shared/auth/decorators'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { Role } from '@app/src/shared/enums'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { FilterDeleted } from '@app/src/shared/decorators'

@ApiTags('Admin Languages')
@Controller('admin/languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Get/Filter All Langauge' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.languagesService.show(query)
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Get/Filter All Langauge' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Language does not exist'))
  create(@Body() createLanguageDto: CreateLanguageDto) {
    return this.languagesService.create(createLanguageDto)
  }

  @Put()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin Update Langauge' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Langauge does not exist'))
  update(@Body() updateLanguageDto: UpdateLanguageDto) {
    return this.languagesService.updateOne(updateLanguageDto)
  }
}
