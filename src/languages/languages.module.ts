import { LanguagesModule as AdminLanguagesModule } from '@app/src/admin/languages/languages.module'
import { LanguagesController } from '@app/src/languages/languages.controller'
import { Module } from '@nestjs/common'

@Module({
  imports: [AdminLanguagesModule],
  controllers: [LanguagesController],
})
export class LanguagesModule {}
