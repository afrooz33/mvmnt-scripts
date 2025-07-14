import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { BankAccountStatus } from '@app/src/nonprofit/bank-accounts/enums'

export class FilterStatusProperty {
  @ApiPropertyOptional({
    name: 'filter[bank_account_status]',
    description: 'Filter',
    enum: Object.values(BankAccountStatus),
  })
  @IsOptional()
  @IsEnum(BankAccountStatus)
  bank_account_status: BankAccountStatus
}
