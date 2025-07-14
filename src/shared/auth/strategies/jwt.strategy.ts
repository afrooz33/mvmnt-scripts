import { Request } from 'express'
import * as JwksRsa from 'jwks-rsa'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { UserTokenDto } from '@app/shared/auth/dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      passReqToCallback: true,
      secretOrKeyProvider: JwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: configService.get<string>('auth.jwt.jwks'),
      }),
      audience: configService.get<string>('auth.jwt.audience'),
      issuer: configService.get<string>('auth.jwt.issuer'),
      algorithms: ['RS256'],
    })
  }

  async validate(request: Request, payload: any): Promise<UserTokenDto> {
    try {
      let token = request.header('Authorization').replace('Bearer ', '')
      const tokenData: any = this.jwtService.decode(token)
      const nowTime = Math.round(new Date().getTime() / 1000)

      if (tokenData && nowTime > tokenData.exp) {
        if (!tokenData.rememberMeValidity) {
          throw new Error(ErrorKey.TOKEN_EXPIRED)
        }
        if (tokenData.rememberMeValidity < nowTime) {
          throw new Error(ErrorKey.TOKEN_EXPIRED)
        }

        token = this.jwtService.sign(
          {
            id: payload.id,
            email: payload.email,
            account_type: payload.account_type,
            two_factor_enabled: payload.two_factor_enabled,
            rememberMe: tokenData.rememberMe,
            rememberMeValidity: tokenData.rememberMeValidity,
          },
          {
            expiresIn: this.configService.get<string>('auth.jwt.access.expiresIn'),
          },
        )
      }

      return {
        id: payload.id,
        email: payload.email,
        account_type: payload.account_type,
        two_factor_enabled: payload.two_factor_enabled,
        token,
      }
    } catch (error) {
      throw new UnauthorizedException(ErrorKey.UNAUTHORIZED)
    }
  }
}
