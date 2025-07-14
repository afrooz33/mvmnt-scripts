import { ApiProperty } from '@nestjs/swagger'

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction hash',
    example: '0x123...abc',
  })
  hash: string

  @ApiProperty({
    description: 'Block number where the transaction was mined',
    example: 12345678,
  })
  blockNumber: number

  @ApiProperty({
    description: 'Timestamp when the transaction was mined',
    example: '2024-03-21T12:34:56.789Z',
  })
  timestamp: string
}
