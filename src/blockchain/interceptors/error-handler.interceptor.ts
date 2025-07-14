import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlerInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Get the original request path
        const request = context.switchToHttp().getRequest()
        const path = request.url

        // Log detailed error information
        this.logger.error(`Error in request to ${path}: ${error.message}`)

        // Prevent "Failed to get perk details" error from showing up everywhere
        if (error.message && error.message.includes('Failed to get perk details')) {
          this.logger.error(
            'CRITICAL ISSUE DETECTED: "Failed to get perk details" error is being incorrectly propagated to other endpoints.',
          )
          this.logger.error(
            'This likely means there is a code path where getPerkDetails() is being called inappropriately.',
          )
          this.logger.error(
            'Check the contract compatibility - the method may not exist on the blockchain contract.',
          )

          // Determine correct error message based on the path
          let errorMessage = 'An error occurred'
          if (path.includes('brand-perks-count')) {
            errorMessage = 'Failed to get brand perks count'
          } else if (path.includes('brand-snapshots')) {
            errorMessage = 'Failed to get brand snapshots'
          } else if (path.includes('available')) {
            errorMessage = 'Failed to get available perks'
          } else if (path.includes('eligibility')) {
            errorMessage = 'Failed to check eligibility'
          } else {
            // Keep the original error message for other endpoints
            errorMessage = error.message
          }

          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: errorMessage,
                  message: 'Please try again - blockchain contract operation currently unavailable',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          )
        }

        // Just pass through other errors
        return throwError(() => error)
      }),
    )
  }
}
