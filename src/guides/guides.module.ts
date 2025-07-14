import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GuidesEntity } from '@app/src/admin/guides/entities/guides.entity'
import { GuidesController } from './guides.controller'
import { GuidesService } from './guides.service'

@Module({
  imports: [TypeOrmModule.forFeature([GuidesEntity])],
  controllers: [GuidesController],
  providers: [GuidesService],
})
export class GuidesModule {}
