import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LanguagesService } from '@app/src/admin/languages/languages.service'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { LanguagesController } from '@app/src/admin/languages/languages.controller'
import { LanguageAlphabetsEntity } from './entities/language-alphabets.entity'

@Module({
  imports: [TypeOrmModule.forFeature([LanguageEntity, LanguageAlphabetsEntity])],
  controllers: [LanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
