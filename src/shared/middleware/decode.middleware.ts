import * as cookieParser from 'cookie-parser'
import { Request, Response, NextFunction } from 'express'
import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class ParseCookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    cookieParser()(req, res, next)
  }
}
