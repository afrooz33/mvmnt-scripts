import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDateString,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator'
import { DisplaySetting, WishlistStatus } from '@app/src/users/wishlist/enums'

export class CreateWishlistDto {
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
  purchase_deadline: Date

  @ApiProperty({
    enum: Object.values(DisplaySetting),
    default: DisplaySetting.REMOVE_ITEM_FROM_LIST,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(DisplaySetting)
  readonly display_setting: DisplaySetting

  @ApiProperty({
    enum: Object.values(WishlistStatus),
    default: WishlistStatus.PUBLIC,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(WishlistStatus)
  readonly status: WishlistStatus

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => o.image)
  readonly image: string

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly tag: string

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly address: string
}
