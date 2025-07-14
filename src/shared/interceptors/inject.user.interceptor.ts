import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'

export const REQUEST_CONTEXT = 'user'

@Injectable()
export class InjectUserInterceptor implements NestInterceptor {
  constructor(
    private type?: NonNullable<'query' | 'body' | 'params'>,
    private property: string = 'user',
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()

    if (this.type && request[this.type]) {
      request[this.type][this.property] = request.user.id
    }

    return next.handle()
  }
}
