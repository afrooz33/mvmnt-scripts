import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { I18nService } from 'nestjs-i18n'
import { ErrorKey } from '@app/shared/enums'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse = JSON.parse(JSON.stringify(exception.getResponse()))

    if (exceptionResponse?.message?.includes('duplicate key value violates unique constraint')) {
      status = HttpStatus.CONFLICT
      exceptionResponse.message = ErrorKey.CONFLICT
    }

    const message: string = await this.getMessage.call(
      this,
      request,
      exceptionResponse.message || exception.message,
      status,
    )

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toLocaleDateString(),
      path: request.url,
      method: request.method,
      error: exceptionResponse.error,
      message,
    }

    Logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'ExceptionFilter',
    )

    response.status(status).json(errorResponse)
  }

  private async getMessage(req, message, status): Promise<string> {
    const lang = req.headers['x-lang'] as string
    const options: any = {}

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      options.key = ErrorKey.INTERNAL_SERVER_ERROR
    }

    Logger.error(`${req.method} ${req.url}`, message, 'ExceptionFilterMessage')

    if (message instanceof Object) {
      return message
    }

    if (message.startsWith('Validation')) {
      return message
    }

    if (message.startsWith('{')) {
      const { key, args } = JSON.parse(message)

      options.key = key
      options.args = args
    } else {
      options.key = Object.values(ErrorKey).includes(message) ? message : ErrorKey.TRY_AGAIN
    }

    return await this.i18n.t(`errors.${options.key}`, {
      lang,
      args: options.args,
    })
  }
}
