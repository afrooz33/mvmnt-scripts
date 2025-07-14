import { BankAccountType } from '@app/src/nonprofit/bank-accounts/enums'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator'

export class CreateBankAccountDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly bank_name: string

  @ApiProperty({ enum: BankAccountType, required: true })
  @IsEnum(BankAccountType)
  @IsDefined()
  readonly bank_account_type: BankAccountType

  @ApiProperty({ required: true, type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly branch_code: string

  @ApiProperty({ required: true, type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly account_number: string

  @ApiProperty({ required: true, type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly account_holder_name: string

  @ApiProperty({ required: false, type: 'string' })
  @IsDefined()
  @IsBoolean()
  @IsNotEmpty()
  readonly is_default?: boolean
}
