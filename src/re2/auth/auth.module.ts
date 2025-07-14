import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { jwtConfig, passportConfig } from 'config'
import { JwtStrategy } from '@app/shared/auth/strategies'
import { MailModule } from '@app/src/mail/mail.module'
import { UserModule } from '@app/src/re2/user/user.module'
import { AuthService } from '@app/src/re2/auth/auth.service'
import { AuthController } from '@app/src/re2/auth/auth.controller'
import { ProfileModule } from '@app/src/re2/profile/profile.module'
import { Web3AuthModule } from '@app/src/web3auth/web3auth.module'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'

@Module({
  imports: [
    ConfigModule,
    PassportModule.registerAsync(passportConfig),
    JwtModule.registerAsync(jwtConfig),
    UserModule,
    ProfileModule,
    MailModule,
    Web3AuthModule,
    PaymentMethodModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConfigService],
})
export class AuthModule {}
