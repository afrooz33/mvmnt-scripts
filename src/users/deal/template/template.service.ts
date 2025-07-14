import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { InjectRepository } from '@nestjs/typeorm'
import { TemplateEntity } from './entities/template.entity'

@Injectable()
export class TemplateService extends MyService<TemplateEntity> {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templateRepository: Repository<TemplateEntity>,
  ) {
    super(templateRepository, 'user/deal/templates')
  }
}
