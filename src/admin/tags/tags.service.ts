import { getTagsService } from '@app/src/admin/tags/services'
import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { MyService } from '@app/src/shared/base'

@Injectable()
export class TagsService extends MyService<TagEntity> {
  constructor(
    @InjectRepository(TagEntity)
    public tagRepository: Repository<TagEntity>,
  ) {
    super(tagRepository, 'admin/tags')
  }

  getTags = getTagsService.bind(this)
}
