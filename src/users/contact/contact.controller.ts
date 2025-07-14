import {
  Body,
  Post,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Get,
  Query,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiConsumes,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { UploadHelper } from '@app/src/images/helper/Upload.helper'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { ContactService } from './contact.service'
import { ReplyDto, QueryDto, CreateContactDto, UploadAttachmentDto } from './dto'

@ApiTags('User contact us')
@Controller('users/contact-us')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get logged in user's combined messages (Contact Us & Order Related)" })
  @ApiOkResponse({ description: 'Paginated list of combined messages.', type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  getList(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryDto,
    @User('id') user: string,
  ): Promise<PaginateRO> {
    return this.contactService.showList(query, user)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginateRO })
  @ApiOperation({ summary: "Get logged in user's contact us tickets" })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  getAll(@Query(new ValidationPipe()) query: QueryDto, @User('id') user: string) {
    return this.contactService.show(query, user)
  }

  @Get(':id/show/:zendesk_ticket_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginateRO })
  @ApiOperation({ summary: "Get logged in user's contact us ticket" })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  showOne(
    @Param('id') id: string,
    @Param('zendesk_ticket_id') zendesk_ticket_id: string,
    @User('id') user: string,
  ) {
    return this.contactService.showOne(id, user, zendesk_ticket_id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User initiate contact us ticket' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Ticket does not exist'))
  verification(@User('id') userId: string, @Body() payload: CreateContactDto) {
    return this.contactService.create(payload, userId)
  }

  @Post('handle/webhook')
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Ticket does not exist'))
  handleWebhook(@Body() payload: any) {
    return this.contactService.update(payload)
  }

  @Patch(':id/mark-read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Mark user contact us as read' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Ticket does not exist'))
  markRead(@User('id') userId: string, @Param('id') id: string) {
    return this.contactService.markRead(id, userId)
  }

  @Post(':zendesk_ticket_id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User reply contact us ticket' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Ticket does not exist'))
  reply(
    @User('id') userId: string,
    @Body() payload: ReplyDto,
    @Param('zendesk_ticket_id') zendesk_ticket_id: string,
  ) {
    return this.contactService.reply(payload, userId, zendesk_ticket_id)
  }

  @Post('upload/attachment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Upload attachment for contact us ticket' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiConsumes('multipart/form-data')
  @ApiNotFoundResponse(GetResponse('File does not exist'))
  @UseInterceptors(FileInterceptor('file', UploadHelper.zendesk_options))
  upload(@UploadedFile() file: Express.Multer.File, @Body() { type }: UploadAttachmentDto) {
    return this.contactService.upload(file, type)
  }
}
