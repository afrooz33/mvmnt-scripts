import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { UserTypes } from '@app/src/shared/enums'
import { OptionalJwtAuthGuard } from '@app/src/shared/auth/guards'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { DealShareService } from './deal/deal-share.service'
import { NonprofitShareService } from './nonprofit/nonprofit-share.service'
import { ShareDealDto, ShareDonationProjectDto, ShareNonprofitDto } from './dto'
import { DonationProjectShareService } from './donation-project/donation-project-share.service'

@ApiTags('User Sns Sharing')
@Controller('user/sns/shares')
export class ShareController {
  constructor(
    private readonly dealShareService: DealShareService,
    private readonly donationProjectShareService: DonationProjectShareService,
    private readonly nonprofitShareService: NonprofitShareService,
  ) {}

  @Post('deal')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User share deal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  shareDeal(@Body() payload: ShareDealDto) {
    return this.dealShareService.dealShare(payload)
  }

  @Post('donation-project')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User share donation project' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Donation project does not exist'))
  shareDonationProject(@Body() payload: ShareDonationProjectDto, @User('id') userId: string) {
    return this.donationProjectShareService.donationProjectShare(payload, userId)
  }

  @Post('nonprofit')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User share nonprofit' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit does not exist'))
  shareNonprofit(@Body() payload: ShareNonprofitDto, @User('id') userId: string) {
    return this.nonprofitShareService.nonprofitPageShare(payload, userId)
  }
}
