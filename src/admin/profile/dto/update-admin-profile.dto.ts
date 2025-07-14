import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator'
import { Timezones } from '@app/src/shared/constant'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'

export class UpdateAdminProfileDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  readonly email: string

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  readonly notification_email?: string

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
    type: String,
    format: 'uuid',
    example: '40aa69fc-b610-4db5-a5e8-913a631f4a6d',
  })
  @IsOptional()
  readonly language?: LanguageEntity
}
