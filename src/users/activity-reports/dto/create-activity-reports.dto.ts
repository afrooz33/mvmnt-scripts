import {
  IsEnum,
  IsUUID,
  IsArray,
  IsDefined,
  IsOptional,
  IsNotEmpty,
  ArrayMinSize,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PayloadStatus } from '@app/src/users/activity-reports/enums'

export class CreateActivityReportsDto {
  @ApiProperty({
    description: 'Upload assets',
    isArray: true,
    format: 'uuid',
    example: ['4f4e2cb0-a0ea-4415-86ee-ed878a6a282b'],
  })
  @IsArray()
  @IsDefined()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true })
  readonly assets: string[]

  @ApiProperty({
    description: 'Provide report content',
    type: String,
  })
  @IsOptional()
  readonly content?: string

  @ApiProperty({
    description: 'Activity report status',
    enum: Object.values(PayloadStatus),
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(PayloadStatus)
  readonly status: PayloadStatus
}
