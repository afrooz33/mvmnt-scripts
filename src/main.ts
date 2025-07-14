import helmet from 'helmet'
import { json } from 'body-parser'
import { NestFactory } from '@nestjs/core'
import * as compression from 'compression'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import { useContainer } from 'class-validator'
import { ValidationPipe } from '@nestjs/common'
import setupSwagger from '@app/shared/swagger'
import { ICorsConfig } from '@app/shared/interfaces'
import { RawBodyMiddleware } from '@app/shared/middleware'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService: ConfigService = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  )

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  )

  app.use(compression())

  app.use(cookieParser())

  app.use(RawBodyMiddleware())

  app.use(json({ limit: '50mb' }))

  app.enableCors(configService.get<ICorsConfig>('cors'))

  app.setGlobalPrefix(configService.get<string>('app.prefix'))

  setupSwagger(app)

  await app.listen(configService.get<number>('app.port'))
}

bootstrap()
