import { Module } from '@nestjs/common'
import { BankAccountsService } from './bank-accounts.service'
import { BankAccountsController } from './bank-accounts.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BankAccountEntity } from '@app/src/nonprofit/bank-accounts/entities/bank-account.entity'

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountEntity])],
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
})
export class BankAccountsModule {}
