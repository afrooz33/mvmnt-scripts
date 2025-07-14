import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const { method, url, ip, headers } = req
    const userAgent = headers['user-agent'] || ''
    const now = Date.now()

    // Log security-relevant information
    this.logger.log(`Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`)

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now
        this.logger.log(`Response: ${method} ${url} - ${responseTime}ms`)
      }),
      catchError((error) => {
        const responseTime = Date.now() - now
        this.logger.error(`Error: ${method} ${url} - ${responseTime}ms - ${error.message}`)

        // Log security events
        if (error.status === 401 || error.status === 403) {
          this.logger.warn(`Security Event: Unauthorized access attempt from ${ip} to ${url}`)
        }

        throw error
      }),
    )
  }
}
