import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MyService } from '@app/src/shared/base'
import { InvitationEntity } from './entities/invitation.entity'
import { showService, saveService, inviteService } from './services'

@Injectable()
export class InvitationService extends MyService<InvitationEntity> {
  constructor(
    @InjectRepository(InvitationEntity)
    private readonly invitationRepository: Repository<InvitationEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(invitationRepository, 'user/invitation')
  }

  show = showService.bind(this)
  save = saveService.bind(this)
  invite = inviteService.bind(this)
}
