import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { MailService } from '@app/src/mail/mail.service'
import { DealService } from '@app/src/users/deal/deal.service'
import { UpdateNoteEntity } from './entities/update-note.entity'
import { createService } from './services'

@Injectable()
export class UpdateNoteService extends MyService<UpdateNoteEntity> {
  constructor(
    @InjectRepository(UpdateNoteEntity)
    private readonly updateNotesRepository: Repository<UpdateNoteEntity>,
    private readonly dealService: DealService,
    private readonly mailService: MailService,
  ) {
    super(updateNotesRepository, 'users/deal/update-notes')
  }

  create = createService.bind(this)
}
