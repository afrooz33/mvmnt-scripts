import { ConfigModule, ConfigService } from '@nestjs/config'

const useFactory = () => ({
  defaultStrategy: 'jwt',
})

export default {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory,
}
