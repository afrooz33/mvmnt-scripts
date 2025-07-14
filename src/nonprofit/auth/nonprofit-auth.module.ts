import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { jwtConfig, passportConfig } from 'config'
import { JwtStrategy } from '@app/shared/auth/strategies'
import { NonprofitAuthService } from './nonprofit-auth.service'
import { NonprofitAuthController } from './nonprofit-auth.controller'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { NonprofitProfileModule } from '@app/src/nonprofit/profile/nonprofit-profile.module'
import { MailModule } from '@app/src/mail/mail.module'
import { Web3AuthModule } from '@app/src/web3auth/web3auth.module'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'

@Module({
  imports: [
    ConfigModule,
    PassportModule.registerAsync(passportConfig),
    JwtModule.registerAsync(jwtConfig),
    NonprofitUserModule,
    NonprofitProfileModule,
    MailModule,
    Web3AuthModule,
    PaymentMethodModule,
  ],
  controllers: [NonprofitAuthController],
  providers: [NonprofitAuthService, JwtStrategy, ConfigService],
})
export class NonprofitAuthModule {}
