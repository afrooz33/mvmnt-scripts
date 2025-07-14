import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'

export class RaffleWinnerDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'Single raffle winner id',
    example: 'a41e1f49-ebf4-484e-9734-dfd85a53dbf3',
    format: 'uuid',
  })
  @IsOptional()
  readonly raffle_winner_id?: string
}
