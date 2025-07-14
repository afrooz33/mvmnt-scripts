import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import { ISwaggerConfig } from '@app/shared/interfaces'

export default (app: INestApplication) => {
  const configService: ConfigService = app.get(ConfigService)

  const swaggerConfig: ISwaggerConfig = configService.get<ISwaggerConfig>('swagger')

  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .build()

  SwaggerModule.setup(swaggerConfig.prefix, app, SwaggerModule.createDocument(app, config))
}
