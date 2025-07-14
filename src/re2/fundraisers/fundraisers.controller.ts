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
  Put,
  Get,
  Body,
  Post,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Param,
  Delete,
  Patch,
} from '@nestjs/common'
import { UserTypes } from '@app/src/shared/enums'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { FundraiserService } from './fundraisers.service'
import {
  QueryDto,
  FilterRecipientDto,
  CreateFundraiserDto,
  UpdateFundraiserDto,
  FundraiserChangeStatusDto,
} from './dto'

@ApiTags('RE2 Fundraisers')
@Controller('re2/fundraisers')
export class FundraiserController {
  constructor(private readonly fundraiserService: FundraiserService) {}

  @Get()
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 list all fundraiser form or page' })
  show(@Query() query: QueryDto, @User('id') userId: string) {
    return this.fundraiserService.show(query, userId)
  }

  @Get(':id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 fundraiser form or page detail' })
  showOne(@Param('id') id: string, @User('id') userId: string) {
    return this.fundraiserService.showOne(id, userId)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.RE2)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 create fundraiser form or page' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  create(@Body() payload: CreateFundraiserDto, @User('id') userId: string) {
    return this.fundraiserService.create(payload, userId)
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.RE2)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 update fundraiser form or page' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  update(@Body() payload: UpdateFundraiserDto, @User('id') userId: string) {
    return this.fundraiserService.update(payload, userId)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 delete fundraiser form or page' })
  delete(@Param('id') id: string, @User('id') userId: string) {
    return this.fundraiserService.delete(id, userId)
  }

  @Patch('change-status/:id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 update fundraiser form or page change status' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  async changeAccountStatus(
    @Param('id') id: string,
    @Body() payload: FundraiserChangeStatusDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.fundraiserService.changeStatus(id, payload, userId)
  }

  @Put(':id/clone')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 clone fundraiser form or page' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  clone(@Param('id') id: string, @User('id') userId: string) {
    return this.fundraiserService.clone(id, userId)
  }

  @Get('filter/recipients')
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 filter donation recipient - nonprofit or donation project' })
  filterRecipient(@Query() query: FilterRecipientDto) {
    return this.fundraiserService.filterRecipient(query)
  }
}
