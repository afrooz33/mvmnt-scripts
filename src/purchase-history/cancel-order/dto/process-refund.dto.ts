import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Wallet address from which the refund is sent',
    example: '0xe869...d1234',
  })
  @IsNotEmpty()
  @IsString()
  from_wallet: string

  @ApiProperty({
    description: 'MVMNT wallet address to which the refund is sent',
    example: '0xe869...d1234',
  })
  @IsNotEmpty()
  @IsString()
  to_wallet: string

  @ApiProperty({
    description: 'Blockchain transaction ID for the refund',
    example: '0x4ee25...8dcaf',
  })
  @IsNotEmpty()
  @IsString()
  transaction_id: string
}
