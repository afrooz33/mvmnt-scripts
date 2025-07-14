import { Reflector } from '@nestjs/core'
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { ErrorKey, Role } from '@app/shared/enums'
import { ROLES_KEY } from '@app/src/shared/auth/decorators/roles.decorator'

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles?.length) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    const hasAccess = requiredRoles.some((role) => user?.role === role)

    if (!hasAccess) {
      throw new ForbiddenException(ErrorKey.ACCESS_DENIED)
    }

    return hasAccess
  }
}
