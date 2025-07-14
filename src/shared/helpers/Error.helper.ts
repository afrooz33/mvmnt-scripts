import {
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  PreconditionFailedException,
  InternalServerErrorException,
} from '@nestjs/common'
import { EntityNotFoundError, QueryFailedError } from 'typeorm'

const logger = new Logger('ErrorHandler') // Logger instance

export async function HandleErrors(error: any): Promise<any> {
  if (error instanceof NotFoundException) {
    logger.error('An error occurred:', { error: error.message ?? error, stack: error.stack })

    throw new NotFoundException(error.message ?? error)
  } else if (error instanceof QueryFailedError) {
    logger.error('An error occurred:', {
      error: error.message ?? error,
      stack: error.stack,
    })

    throw new BadRequestException(error.message ?? error)
  } else if (error instanceof BadRequestException) {
    logger.error('An error occurred:', { error: error.message ?? error, stack: error.stack })

    throw new BadRequestException(error.message ?? error)
  } else if (error instanceof InternalServerErrorException) {
    logger.error('Internal server error occurred:', {
      error: error.message ?? error,
      stack: error.stack,
    })

    throw new InternalServerErrorException('Internal server error occurred.')
  } else if (error instanceof PreconditionFailedException) {
    logger.error('Precondition failed:', { error: error.message ?? error, stack: error.stack })

    throw new PreconditionFailedException(error.message ?? error)
  } else if (error instanceof ForbiddenException) {
    logger.error('Forbidden error occurred:', {
      error: error.message ?? error,
      stack: error.stack,
    })

    throw new ForbiddenException(error.message ?? error)
  } else if (error instanceof EntityNotFoundError) {
    logger.error('Entity not found error occurred:', {
      error: error.message ?? error,
      stack: error.stack,
    })

    throw new NotFoundException(error.message ?? error)
  } else {
    logger.error('Unexpected error occurred:', {
      error: error.message ?? error,
      stack: error.stack,
    })

    throw new InternalServerErrorException('An unexpected error occurred.')
  }
}
