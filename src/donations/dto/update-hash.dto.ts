import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class UpdateDonationHashDto {
  @ApiProperty({
    description: 'Payment Donation ID',
    example: '195eae0c-350a-4413-bcaf-e034a0b190b6',
    format: 'uuid',
  })
  @IsDefined()
  @IsString()
  @IsUUID()
  readonly transaction: string

  @ApiProperty({
    description: 'Transaction Hash from Blockchain',
    example: '0xd5fe70b14321d811ef2fe575b34697400f8f7a3c38d763926742aaf67980d5f0',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly transaction_hash: string
}
