import { IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CreateBankAccountDto } from './create-bank-account.dto'

export class UpdateBankAccountDto extends CreateBankAccountDto {
  @ApiProperty({ format: 'uuid' })
  @IsOptional()
  readonly id: string
}
