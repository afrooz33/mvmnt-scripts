import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { LanguageEntity } from './entities/language.entity'

@Injectable()
export class LanguagesService extends MyService<LanguageEntity> {
  constructor(
    @InjectRepository(LanguageEntity)
    public languageRepository: Repository<LanguageEntity>,
  ) {
    super(languageRepository, 'admin/languages')
  }
}
