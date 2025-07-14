import { config } from 'dotenv'

config()

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SeedService } from './seed.service'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TYPEORM_DB_HOST,
      port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [`${__dirname}/../**/*.entity.js`],
      logging: false,
      synchronize: false,
    }),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
