import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'

export class ShippingMethodTranslations {
  @ApiProperty({ required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly company: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly max_size: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly max_weight: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly price: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly details_url: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly description: string

  @ApiProperty({
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly language: LanguageEntity
}
