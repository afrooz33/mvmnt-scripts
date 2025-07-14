import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class DeleteDealDto {
  @ApiPropertyOptional({
    description: 'Reason for deleting the raffle deal',
    type: String,
  })
  @IsOptional()
  readonly reason_to_delete?: string
}
