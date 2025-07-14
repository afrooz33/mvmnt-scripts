import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { DonationPreset } from '@app/src/nonprofit/profile/entities/properties'
import { Timezones } from '@app/src/shared/constant'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator'

export class UpdateNonprofitProfileDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  readonly email?: string

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  readonly notification_email?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly foundation_name?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly corporate_number?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUrl()
  readonly foundation_url?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly phone?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly introduction?: string

  @ApiProperty({
    description: 'Timezone',
    enum: Object.keys(Timezones),
    example: 'Asia/Tokyo',
  })
  @IsString()
  @IsOptional()
  @IsEnum(Object.keys(Timezones), {
    message: 'Timezone is not valid',
  })
  readonly timezone?: string

  @ApiProperty({
    description: 'Donation presets',
    type: [Number],
    minimum: 1,
    maximum: 5,
    example: [10, 20, 50, 100, 200],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsOptional()
  readonly donation_presets?: DonationPreset

  @ApiProperty({
    description: 'Default donation preset value',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(4)
  readonly default_donation_preset_amount?: number

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  readonly profile_image?: ImagesEntity

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  readonly language?: LanguageEntity

  @ApiProperty({
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  readonly tags?: TagEntity[]
}
