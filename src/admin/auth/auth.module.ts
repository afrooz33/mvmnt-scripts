import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { jwtConfig, passportConfig } from '@app/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '@app/src/admin/user/user.module'
import { AdminJwtStrategy } from '@app/src/shared/auth/strategies/admin-jwt.strategy'
import { Web3AuthModule } from '@app/src/web3auth/web3auth.module'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'

@Module({
  imports: [
    ConfigModule,
    PassportModule.registerAsync(passportConfig),
    JwtModule.registerAsync(jwtConfig),
    UserModule,
    Web3AuthModule,
    PaymentMethodModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtStrategy],
})
export class AuthModule {}
