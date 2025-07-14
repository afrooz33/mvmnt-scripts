import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CancelSingleRecurringDonationDto {
  @ApiProperty({
    description: 'Recurring Donation ID',
    example: '86840c31-1d66-4707-9113-db00298b75dc',
    format: 'uuid',
  })
  @IsDefined()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  readonly recurring_donation: string
}
