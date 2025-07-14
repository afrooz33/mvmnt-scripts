import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'
import { PoolError } from '../services/pool.service'

@Catch()
export class PoolExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PoolExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let errorResponse: any = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...errorResponse,
          ...exceptionResponse,
        }
      } else {
        errorResponse.message = exceptionResponse
      }
    } else if (exception instanceof PoolError) {
      status = HttpStatus.BAD_REQUEST
      errorResponse = {
        ...errorResponse,
        message: exception.message,
        code: exception.code,
        statusCode: status,
      }
    } else {
      this.logger.error('Unhandled exception:', exception)
      errorResponse = {
        ...errorResponse,
        message: 'An unexpected error occurred',
        statusCode: status,
      }
    }

    // Add request details for debugging
    errorResponse.requestDetails = {
      url: request.url,
      method: request.method,
      body: (request as any).body,
      query: (request as any).query,
      params: (request as any).params,
    }

    response.status(status).json(errorResponse)
  }
}
