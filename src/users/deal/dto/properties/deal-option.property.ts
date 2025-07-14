import { ApiProperty } from '@nestjs/swagger'

export class DealOption {
  @ApiProperty({
    format: 'uuid',
    type: 'string',
    example: '48571d64-7562-4dd6-a01f-8a3a8a662b04',
  })
  readonly id: string
}
