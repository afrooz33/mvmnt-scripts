import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { SKIP_AUTH } from '@app/src/shared/auth/decorators/skip-auth.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ])

    try {
      const activate = (await super.canActivate(context)) as boolean

      return skipAuth || activate
    } catch (e) {
      if (skipAuth) {
        return true
      }

      throw new UnauthorizedException(ErrorKey.UNAUTHORIZED)
    }
  }
}
