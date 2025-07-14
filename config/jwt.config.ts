import { readFileSync } from 'node:fs'
import { Algorithm } from 'jsonwebtoken'
import { ConfigModule, ConfigService } from '@nestjs/config'

const useFactory = (configService: ConfigService) => {
  const path = configService.get<string>('auth.jwt.privateKeyPath')
  const privateKey = readFileSync(path, 'utf8')
    .replace(/ PRIVATE /g, 'PRIVATE')
    .replace(/ /g, '\n')
    .replace(/PRIVATE/g, ' PRIVATE ')

  return {
    privateKey,
    signOptions: {
      expiresIn: configService.get<string | number>('auth.jwt.access.expiresIn'),
      algorithm: 'RS256' as Algorithm,
      keyid: configService.get<string>('auth.jwt.kid'),
      audience: configService.get<string>('auth.jwt.audience'),
      issuer: configService.get<string>('auth.jwt.issuer'),
    },
  }
}

export default {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory,
}
