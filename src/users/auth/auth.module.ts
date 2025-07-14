import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PassportModule } from '@nestjs/passport'
import { jwtConfig, passportConfig } from '@app/config'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { JwtStrategy, SubgraphStrategy } from '@app/src/shared/auth/strategies'
import { ParseCookieMiddleware } from '@app/src/shared/middleware'
import { MailModule } from '@app/src/mail/mail.module'
import { UserModule } from '@app/src/users/user/user.module'
import { Web3AuthModule } from '@app/src/web3auth/web3auth.module'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { InvitationModule } from '@app/src/users/invitation/invitation.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { UserSessionEntity } from '@app/src/users/user/entities/user-session.entity'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { AuthService } from './auth.service'
import { UserSocialLogin } from './services'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserSessionEntity]),
    ConfigModule,
    PassportModule.registerAsync(passportConfig),
    JwtModule.registerAsync(jwtConfig),
    UserModule,
    MailModule,
    InvitationModule,
    NonprofitUserModule,
    RegionSettingsModule,
    Web3AuthModule,
    PaymentMethodModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConfigService, UserSocialLogin, SubgraphStrategy],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ParseCookieMiddleware).forRoutes('signup')
  }
}
