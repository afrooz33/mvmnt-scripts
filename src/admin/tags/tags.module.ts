import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TagsController } from '@app/src/admin/tags/tags.controller'
import { TagsService } from '@app/src/admin/tags/tags.service'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { TagTranslationEntity } from '@app/src/admin/tags/entities/tag.translation.entity'
import { LanguagesModule } from '@app/src/admin/languages/languages.module'
import { IsLanguageActiveConstraint } from '@app/src/shared/validations'
import { TagSubscriber } from '@app/src/admin/tags/entities/tag.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity, TagTranslationEntity]), LanguagesModule],
  controllers: [TagsController],
  providers: [TagsService, IsLanguageActiveConstraint, TagSubscriber],
  exports: [TagsService],
})
export class TagsModule {}
