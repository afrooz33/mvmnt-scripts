import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import * as crypto from 'crypto'
import { ErrorKey } from '@app/src/shared/enums'

@Injectable()
export class VerifyShopifyTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const request = context.switchToHttp().getRequest()
      const token = request.headers['x-shopify-token']

      if (!token) {
        throw new ForbiddenException(ErrorKey.FORBIDDEN)
      }

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        process.env.SHOP_SESSION_AES_SECRET,
        process.env.SHOP_SESSION_AES_IV,
      )

      let decrypted = decipher.update(token, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      const currentTimestamp = Math.floor(Date.now() / 1000)

      if (Math.abs(currentTimestamp - Number(decrypted)) > 60) {
        throw new UnauthorizedException(ErrorKey.UNAUTHORIZED)
      }

      return next.handle()
    } catch (error) {
      throw new InternalServerErrorException('Error processing Shopify token')
    }
  }
}
