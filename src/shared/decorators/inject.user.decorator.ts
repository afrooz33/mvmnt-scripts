import { applyDecorators, UseInterceptors, UsePipes } from '@nestjs/common'
import { InjectUserInterceptor } from '@app/src/shared/interceptors'
import { StripRequestContextPipe } from '@app/src/shared/pipes'

export function InjectUserToQuery() {
  return applyDecorators(InjectUserTo('query'))
}

export function InjectUserToBody(property?: string) {
  return applyDecorators(InjectUserTo('body', property))
}

export function InjectUserToParam() {
  return applyDecorators(InjectUserTo('params'))
}

export function InjectUserTo(context: 'query' | 'body' | 'params', property?: string) {
  return applyDecorators(
    UseInterceptors(new InjectUserInterceptor(context, property)),
    UsePipes(StripRequestContextPipe),
  )
}
