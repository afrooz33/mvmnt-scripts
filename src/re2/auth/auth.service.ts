import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailService } from '@app/src/mail/mail.service'
import { UserService } from '@app/src/re2/user/user.service'
import { ProfileService } from '@app/src/re2/profile/profile.service'
import { Web3AuthService } from '@app/src/web3auth/web3auth.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { MyAuthService } from '@app/src/shared/auth/myauth.service'
import { meService, signupService, loginService, createWalletService } from './services'

@Injectable()
export class AuthService extends MyAuthService {
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly userService: UserService,
    public readonly mailService: MailService,
    public readonly userProfileService: ProfileService,
    private readonly web3Auth: Web3AuthService,
    private readonly paymentWalletsService: PaymentWalletsService,
  ) {
    super(
      userService,
      mailService,
      jwtService,
      configService,
      userProfileService,
      configService.get('app.re2DashboardUrl'),
    )
  }

  me = meService.bind(this)
  login = loginService.bind(this)
  signup = signupService.bind(this)
  createWallet = createWalletService.bind(this)
}
