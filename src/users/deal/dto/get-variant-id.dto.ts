import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, ValidateIf } from 'class-validator'

export class GetVariantIdDto {
  @ApiPropertyOptional({
    description: 'Color option value',
    example: 'blue',
    type: String,
  })
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.size && !obj.material && !obj.weight)
  readonly color?: string

  @ApiPropertyOptional({
    description: 'Size option value',
    example: 'XL',
    type: String,
  })
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.color && !obj.material && !obj.weight)
  readonly size?: string

  @ApiPropertyOptional({
    description: 'Material option value',
    example: 'Leather',
    type: String,
  })
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.color && !obj.size && !obj.weight)
  readonly material?: string

  @ApiPropertyOptional({
    description: 'Weight option value',
    example: '1kg',
    type: String,
  })
  @ValidateIf((obj) => !obj.color && !obj.size && !obj.material)
  @IsNotEmpty()
  readonly weight?: string
}
