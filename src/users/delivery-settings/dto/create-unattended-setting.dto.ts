import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'
import { IsUniqueArray } from '@app/src/shared/decorators'

export class CreateUnattendedSettingDto {
  @ApiProperty({
    description: 'Unattended delivery locations',
    example: ['Front desk', 'Backyard', 'Backyard'],
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty({ each: true, message: 'Unattended delivery locations are required' })
  @IsUniqueArray({ message: 'Unattended delivery locations must only contain unique values.' })
  @Transform(({ value }) => value.map((item: string) => item.trim()))
  readonly locations: string[]
}
