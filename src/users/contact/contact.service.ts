import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { createClient } from 'node-zendesk'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { ContactEntity } from './entities/contact.entity'
import { UserService } from '@app/src/users/user/user.service'
import { DealService } from '@app/src/users/deal/deal.service'
import {
  showService,
  replyService,
  createService,
  uploadService,
  updateService,
  showOneService,
  markReadService,
  showListService,
} from './services'

@Injectable()
export class ContactService extends MyService<ContactEntity> {
  private readonly zendeskClient = createClient({
    username: process.env.ZENDESK_EMAIL,
    token: process.env.ZENDESK_API_TOKEN,
    subdomain: process.env.ZENDESK_DOMAIN,
    debug: false,
    logger: console,
  })

  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: Repository<ContactEntity>,
    private readonly userService: UserService,
    private readonly dealService: DealService,
  ) {
    super(contactRepository, 'users/contact-us')
  }

  show = showService.bind(this)
  reply = replyService.bind(this)
  upload = uploadService.bind(this)
  create = createService.bind(this)
  update = updateService.bind(this)
  showOne = showOneService.bind(this)
  markRead = markReadService.bind(this)
  showList = showListService.bind(this)
}
