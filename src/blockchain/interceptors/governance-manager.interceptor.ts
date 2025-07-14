import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class GovernanceManagerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // For transaction responses, preserve the transaction hash at the top level
        if (data && typeof data === 'object' && data.transactionHash) {
          return {
            success: true,
            transactionHash: data.transactionHash,
            data,
            timestamp: new Date().toISOString(),
          }
        }

        // For other responses, use the standard format
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        }
      }),
    )
  }
}
