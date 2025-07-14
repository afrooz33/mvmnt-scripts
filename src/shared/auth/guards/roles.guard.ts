import { Reflector } from '@nestjs/core'
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { ErrorKey, UserTypes } from '@app/shared/enums'
import { USER_TYPE_KEY } from '@app/src/shared/auth/decorators/user-type.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserTypes[]>(USER_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles?.length) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    const hasAccess = requiredRoles.some((account_type) => user?.account_type === account_type)

    if (!hasAccess) {
      throw new ForbiddenException(ErrorKey.ACCESS_DENIED)
    }

    return hasAccess
  }
}
