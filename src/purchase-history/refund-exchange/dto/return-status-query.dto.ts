import { IsUUID, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ReturnStatusQueryDto {
  @ApiPropertyOptional({
    description: 'Cart ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  cart?: string

  @ApiPropertyOptional({
    description: 'Bid ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  bid?: string
}
