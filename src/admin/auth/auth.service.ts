import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AdminUserService } from '@app/src/admin/user/user.service'
import { meService, loginService, changePasswordService, createWalletService } from './services'
import { Web3AuthService } from '@app/src/web3auth/web3auth.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'

@Injectable()
export class AuthService {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly web3Auth: Web3AuthService,
    private readonly paymentWalletsService: PaymentWalletsService,
  ) {}

  login = loginService.bind(this)
  me = meService.bind(this)
  changePassword = changePasswordService.bind(this)
  createWallet = createWalletService.bind(this)
}
