import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FirstLastName } from './'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class ProfileNameDto {
  @ApiProperty({
    description: 'User first name',
    nullable: false,
    type: 'string',
    example: 'John',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly first_name: string

  @ApiProperty({
    description: 'User last name',
    nullable: false,
    type: 'string',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly last_name: string

  @ApiPropertyOptional({
    description: 'First/last name in kana',
    nullable: false,
    type: () => FirstLastName,
  })
  readonly kana: FirstLastName

  @ApiPropertyOptional({
    description: 'First/last name in kanji',
    type: () => FirstLastName,
  })
  readonly kanji: FirstLastName
}
