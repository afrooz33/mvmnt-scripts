import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class RejectCancellationDto {
  @ApiProperty({
    description: 'Reason for rejecting the cancellation request',
    example: 'The order has already been shipped.',
  })
  @IsNotEmpty()
  @IsString()
  reason: string
}
