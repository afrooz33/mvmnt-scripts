import { Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'

import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'

@Catch()
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse = JSON.parse(JSON.stringify(exception.getResponse()))

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toLocaleDateString(),
      error: exceptionResponse.error,
      message:
        status !== HttpStatus.INTERNAL_SERVER_ERROR
          ? exceptionResponse.message || exception.message || null
          : 'Internal server error',
    }

    Logger.error('', JSON.stringify(errorResponse), 'WsExceptionFilter')

    super.catch(new WsException(errorResponse), host)
  }
}
