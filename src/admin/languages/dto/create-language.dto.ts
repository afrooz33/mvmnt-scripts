import { LanguageStatus } from '@app/src/admin/languages/enums'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, IsNotEmpty, IsEnum } from 'class-validator'

export class CreateLanguageDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly code: string

  @ApiProperty({ enum: LanguageStatus })
  @IsEnum(LanguageStatus)
  readonly status: LanguageStatus
}
