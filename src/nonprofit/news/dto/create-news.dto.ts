import { IsDefined, IsString, IsNotEmpty, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { NewsStatus } from '@app/src/nonprofit/news/enums'

export class CreateNewsDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly title: string

  @ApiProperty({ required: true })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly details: string

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.status === NewsStatus.SCHEDULED)
  @IsNotEmpty()
  @IsDefined()
  readonly schedule_date?: Date

  @IsOptional()
  published_date?: Date

  @ApiProperty({ enum: NewsStatus, required: true })
  @IsEnum(NewsStatus)
  @IsDefined()
  readonly status: NewsStatus
}
