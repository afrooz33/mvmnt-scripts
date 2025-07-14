import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { IsImageAvailable } from '@app/src/shared/decorators'
import { UploadType } from '@app/src/shared/enums'
import { UserGender } from '@app/src/users/user/enums'

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'Username',
    type: String,
    example: 'unique_username',
  })
  @IsOptional()
  @IsString()
  readonly username?: string

  @ApiProperty({
    description: 'Display name',
    type: String,
    example: 'User name',
  })
  @IsOptional()
  @IsString()
  readonly display_name?: string

  @ApiProperty({ required: true })
  @IsOptional()
  readonly introduction?: string

  @ApiProperty({ enum: UserGender, required: true })
  @IsEnum(UserGender, {
    message: 'Invalid gender',
  })
  @IsOptional()
  gender?: UserGender

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsImageAvailable(
    {
      message: 'Profile picture is not available',
    },
    UploadType.USER_PROFILE_PICTURE,
  )
  readonly profile_images?: ImagesEntity

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  readonly language?: LanguageEntity
}
