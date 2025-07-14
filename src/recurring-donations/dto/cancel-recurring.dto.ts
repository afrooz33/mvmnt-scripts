import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class CancelRecurringDonationDto {
  @ApiProperty({
    description: 'User ID',
    example: '86840c31-1d66-4707-9113-db00298b75dc',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsUUID()
  readonly user: string
}
