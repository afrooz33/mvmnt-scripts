import {
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { UserTypes } from '@app/src/shared/enums'
import { UpdateNoteService } from './update-note.service'
import { UpdateNoteDto, QueryDto } from './dto'

@ApiTags('User deals update notes')
@Controller('users/deal/update-notes')
export class UpdateNoteController {
  constructor(private readonly updateNoteService: UpdateNoteService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User get deal update notes' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  show(@Query() query: QueryDto) {
    return this.updateNoteService.show(query)
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
  @ApiOperation({ summary: 'User create deal update note' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  create(@Body() payload: UpdateNoteDto, @User('id') userId: string) {
    return this.updateNoteService.create(payload, userId)
  }
}
