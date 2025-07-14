import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class FiltersProperty {
  @ApiProperty({
    name: 'filter[deal]',
    format: 'uuid',
    description: 'Deal id',
    required: true,
    example: '1e9b12ad-8c9d-475d-949a-68b0cbecac30',
  })
  @IsNotEmpty()
  @IsDefined()
  deal: string
}
