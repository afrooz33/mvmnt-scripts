import * as path from 'path'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { IMailConfig } from '@app/shared/interfaces'

const useFactory = async (configService: ConfigService) => {
  const mailConfig: IMailConfig = configService.get<IMailConfig>('mail')

  return {
    transport: {
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.auth.user,
        pass: mailConfig.auth.password,
      },
    },
    defaults: {
      from: mailConfig.auth.user,
    },
    template: {
      dir: path.resolve(process.cwd(), 'src/mail/templates'),
      adapter: new EjsAdapter(),
    },
  }
}

export default {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory,
}
