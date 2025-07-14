import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsUUID,
  IsEnum,
  IsDefined,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator'
import { DisplaySetting, WishlistStatus } from '@app/src/users/wishlist/enums'

export class UpdateWishlistDto {
  @ApiProperty({
    description: 'Wishlist id',
    format: 'uuid',
    example: 'cb93cde6-f67f-4967-9856-5ff210c0c361',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string

  @ApiProperty({
    type: String,
    required: true,
    example: 'Upcoming events',
  })
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(80)
  readonly title: string

  @ApiPropertyOptional({
    type: String,
    required: true,
    example: 'Upcoming events in your city',
  })
  @IsOptional()
  @MaxLength(250)
  readonly description: string

  @ApiPropertyOptional({
    type: Date,
    required: false,
    example: '2022-01-01',
  })
  @IsOptional()
  @IsDateString()
  readonly purchase_deadline: Date

  @ApiProperty({
    enum: Object.values(DisplaySetting),
    default: DisplaySetting.REMOVE_ITEM_FROM_LIST,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(DisplaySetting)
  readonly display_setting: DisplaySetting

  @ApiPropertyOptional({
    enum: Object.values(WishlistStatus),
    default: WishlistStatus.PUBLIC,
  })
  @IsOptional()
  @IsEnum(WishlistStatus)
  readonly status: WishlistStatus

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly image?: string

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly tag?: string

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly address?: string
}
