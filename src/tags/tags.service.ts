import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { showService } from './services'

@Injectable()
export class TagsService extends MyService<TagEntity> {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {
    super(tagRepository, 'tags')
  }

  show = showService.bind(this)
}
