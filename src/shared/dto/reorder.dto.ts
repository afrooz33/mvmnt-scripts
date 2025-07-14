import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'
import { ReorderProperty } from './properties'

export class ReorderDto {
  @ValidateNested({ each: true })
  @Type(() => ReorderProperty)
  @ApiProperty({
    isArray: true,
    required: true,
    minimum: 1,
    maximum: 20,
    example: [
      {
        id: '6c30dd6c-ad98-4fa5-855e-767afa701435',
        display_order: 3,
      },
      {
        id: '6dbd9748-82b4-4874-9d45-094ac3831320',
        display_order: 1,
      },
    ],
  })
  @IsNotEmpty()
  @IsDefined()
  readonly items: ReorderProperty[]
}
