import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class UpdatePaymentHashDto {
  @ApiProperty({
    description: 'Deal Payment ID',
    example: '5da1ca7c-4f96-4865-933e-dbb60fed6e43',
    format: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
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
