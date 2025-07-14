import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RestrictionsService } from './restrictions.service'
import { RestrictionsEntity } from './entities/restrictions.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RestrictionsEntity])],
  providers: [RestrictionsService],
  exports: [RestrictionsService],
})
export class RestrictionsModule {}
