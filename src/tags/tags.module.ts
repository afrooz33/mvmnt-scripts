import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { TagsController } from './tags.controller'
import { TagsService } from './tags.service'

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
