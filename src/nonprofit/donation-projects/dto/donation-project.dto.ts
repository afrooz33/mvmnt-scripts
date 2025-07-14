import { ApiProperty } from '@nestjs/swagger'
import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsEnum,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsNumber,
  MaxLength,
  ArrayMaxSize,
  Min,
  Max,
  ValidateIf,
} from 'class-validator'
import {
  DonationProjectReviewStatus,
  AllowedDonationProjectStatus,
  PostingStatus,
} from '@app/src/nonprofit/donation-projects/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { DonationPreset } from '@app/src/nonprofit/profile/entities/properties'
import { IsImageAvailable } from '@app/src/shared/decorators'
import { UploadType } from '@app/src/shared/enums'

export class DonationProjectDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(11)
  @IsImageAvailable(
    {
      message: 'Image is not available',
    },
    UploadType.DONATION_PROJECT,
  )
  readonly images: ImagesEntity[]

  @ApiProperty({
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly tags: TagEntity[]

  @ApiProperty({
    description: 'Donation project name',
    maximum: 80,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  readonly name: string

  @ApiProperty({ enum: PostingStatus })
  @IsEnum(PostingStatus)
  readonly is_schedule: PostingStatus

  @ApiProperty({ enum: PostingStatus })
  @IsEnum(PostingStatus)
  readonly is_deadline_enabled: PostingStatus

  @ApiProperty({ enum: PostingStatus })
  @IsEnum(PostingStatus)
  readonly is_goal_set: PostingStatus

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.is_schedule === PostingStatus.ENABLED)
  @IsDateString()
  @IsNotEmpty()
  @IsDefined()
  readonly schedule_date?: Date

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.is_deadline_enabled === PostingStatus.ENABLED)
  @IsNotEmpty()
  @IsDateString()
  @IsDefined()
  readonly deadline_date?: Date

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.is_goal_set === PostingStatus.ENABLED)
  @IsNotEmpty()
  @IsNumber()
  readonly goal_amount?: number

  @ApiProperty({ required: true })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  readonly introduction: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly description: string

  @ApiProperty({
    description: 'Donation presets',
    type: [Number],
    minimum: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsOptional()
  donation_presets?: DonationPreset

  @ApiProperty({
    description: 'Default donation preset value',
    default: 0,
  })
  @ValidateIf((o) => o.donation_presets.length)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(4)
  default_donation_preset_amount?: number

  @ApiProperty({
    enum: AllowedDonationProjectStatus,
  })
  @IsEnum(AllowedDonationProjectStatus)
  status: AllowedDonationProjectStatus

  @IsOptional()
  review_status?: DonationProjectReviewStatus
}
