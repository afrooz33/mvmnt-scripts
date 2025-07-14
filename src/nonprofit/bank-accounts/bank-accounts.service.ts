import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { createService, updateService, markDefaultService } from './services'
import { BankAccountEntity } from './entities/bank-account.entity'

@Injectable()
export class BankAccountsService extends MyService<BankAccountEntity> {
  constructor(
    @InjectRepository(BankAccountEntity)
    public bankAccountRepository: Repository<BankAccountEntity>,
  ) {
    super(bankAccountRepository, 'nonprofit/bankAccount')
  }

  create = createService.bind(this)
  update = updateService.bind(this)
  markDefault = markDefaultService.bind(this)
}
