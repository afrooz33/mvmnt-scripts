import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Put,
  Patch,
} from '@nestjs/common'
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
import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { FilterDeleted } from '@app/src/shared/decorators'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { BankAccountsService } from './bank-accounts.service'
import { BankAccountEntity } from './entities/bank-account.entity'
import { CreateBankAccountDto, UpdateBankAccountDto, QueryDto } from './dto'

@ApiTags('Nonprofit Bank Accounts')
@Controller('nonprofit/bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create nonprofit bank account' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() createBankAccountDto: CreateBankAccountDto, @User('id') userId: string) {
    return this.bankAccountsService.create(createBankAccountDto, userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get nonprofit bank accounts' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted('bank_account_status'), new ValidationPipe())
    query: QueryDto,
    @User('id') user: string,
  ): Promise<PaginateRO> {
    return this.bankAccountsService.show(query, user)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get nonprofit bank account' })
  @ApiOkResponse({ type: BankAccountEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Query(new FilterDeleted('bank_account_status'), new ValidationPipe())
    query: QueryDto,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<BankAccountEntity> {
    return this.bankAccountsService.showOne(id, query, userId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update nonprofit bank account' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit bank account does not exist'))
  update(
    @Body() updateBankAccountDto: UpdateBankAccountDto,
    @User('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.bankAccountsService.update(updateBankAccountDto, userId, id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete bank account' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit bank account does not exist'))
  async delete(@Param('id') id: string, @User('id') user: string): Promise<SuccessRO> {
    return this.bankAccountsService.delete(id, { user: { id: user } }, 'bank_account_status')
  }

  @Patch(':id/mark-default')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Mark nonprofit bank account as default' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit bank account does not exist'))
  markDefault(@User('id') userId: string, @Param('id') id: string): Promise<SuccessRO> {
    return this.bankAccountsService.markDefault(id, userId)
  }
}
