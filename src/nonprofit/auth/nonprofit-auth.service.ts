import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { NonprofitProfileService } from '@app/src/nonprofit/profile/nonprofit-profile.service'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { MailService } from '@app/src/mail/mail.service'
import { loginService, signupService, meService, createWalletService } from './services'
import { MyAuthService } from '@app/src/shared/auth/myauth.service'
import { Web3AuthService } from '@app/src/web3auth/web3auth.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'

@Injectable()
export class NonprofitAuthService extends MyAuthService {
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly nonprofitProfileService: NonprofitProfileService,
    public readonly nonprofitUserService: NonprofitUserService,
    public readonly mailService: MailService,
    private readonly web3Auth: Web3AuthService,
    private readonly paymentWalletsService: PaymentWalletsService,
  ) {
    super(
      nonprofitUserService,
      mailService,
      jwtService,
      configService,
      nonprofitProfileService,
      configService.get('app.nonprofitDashboardUrl'),
    )
  }

  login = loginService.bind(this)
  signup = signupService.bind(this)
  me = meService.bind(this)
  createWallet = createWalletService.bind(this)
}
