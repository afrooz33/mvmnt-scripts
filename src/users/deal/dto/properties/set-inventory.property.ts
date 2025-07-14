import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator'

export class SetInventoryProperty {
  @ApiPropertyOptional({
    description: 'Origin Id of the inventory',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  origin?: string

  @ApiProperty({
    description: 'Quantity of the inventory',
    example: 10,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number
}
