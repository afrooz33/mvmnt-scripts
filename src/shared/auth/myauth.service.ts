import { MailService } from '@app/src/mail/mail.service'
import { changePasswordService, forgotPasswordService, resetPasswordService } from './services'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { NonprofitProfileService } from '@app/src/nonprofit/profile/nonprofit-profile.service'
import { ProfileService } from '@app/src/re2/profile/profile.service'

export class MyAuthService {
  constructor(
    public readonly userService: any,
    public readonly mailService: MailService,
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly profileService: NonprofitProfileService | ProfileService,
    public readonly params: any,
  ) {}

  changePassword = changePasswordService.bind(this)
  forgotPassword = forgotPasswordService.bind(this)
  resetPassword = resetPasswordService.bind(this)
}
