import { createParamDecorator, ExecutionContext } from '@nestjs/common'

const decorator = (prop: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()

  return prop ? request.user?.[prop] : request.user
}

export const User = createParamDecorator(decorator)
