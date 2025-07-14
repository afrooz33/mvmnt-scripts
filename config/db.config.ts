/**
 * PostgreSQL @config file
 * ---------------------
 * @return TypeOrmModuleAsyncOptions
 */

import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'

const useFactory = async (config: ConfigService) => ({
  type: config.get<'aurora-data-api'>('TYPEORM_CONNECTION'),
  host: config.get<string>('TYPEORM_DB_HOST'),
  username: config.get<string>('TYPEORM_USERNAME'),
  password: config.get<string>('TYPEORM_PASSWORD'),
  database: config.get<string>('TYPEORM_DATABASE'),
  port: config.get<number>('TYPEORM_PORT'),
  entities: [__dirname + config.get<string>('TYPEORM_ENTITIES')],
  synchronize: true,
  autoLoadEntities: true,
  logging: config.get<string>('NODE_ENV') !== 'production',
  extra: {
    min: 5,
    max: 20,
    poolSize: 20,
    statement_timeout: 10000,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    application_name: 'MVMNT Backend',
  },
  maxQueryExecutionTime: 10000,
  keepConnectionAlive: true,
})

export default {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory,
} as TypeOrmModuleAsyncOptions
