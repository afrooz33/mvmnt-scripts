import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsArray,
  IsDefined,
  MaxLength,
  ValidateIf,
  IsNotEmpty,
  ArrayMaxSize,
} from 'class-validator'
import { UpdateStatus } from '@app/src/shared/enums'
import { IntegrationPayloadStatus } from '@app/src/re2/integrations/enums'

export class CreateCartBannerDto {
  @ApiProperty({
    description: 'Cart banner title',
    example: 'Cart banner title',
  })
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(40)
  readonly name: string

  @ApiProperty({
    description: 'Cart banner round up total status',
    enum: Object.values(UpdateStatus),
    default: UpdateStatus.ENABLED,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(UpdateStatus)
  readonly round_up_total_status: UpdateStatus

  @ApiProperty({
    description: 'Cart banner round up total value',
    example: 1,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly round_up_total_value: number

  @ApiProperty({
    description: 'Cart banner add single $1 donation status',
    enum: Object.values(UpdateStatus),
    default: UpdateStatus.ENABLED,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(UpdateStatus)
  readonly add_single_item_status: UpdateStatus

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    isArray: true,
    example: [
      '00dbddae-2bd0-4270-865b-ecedaeb65514',
      '0633d537-2d8c-4b8e-8e7a-34c7388ec603',
      '07bd6093-f138-45d6-9e8a-c282e935fb82',
    ],
  })
  @IsArray()
  @ArrayMaxSize(3)
  @IsNotEmpty({ each: true, message: 'Invalid nonprofit id' })
  @ValidateIf((o) => !o.donation_projects || o.donation_projects.length === 0)
  nonprofits?: string[]

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    isArray: true,
    example: ['17c850ef-235b-4bb6-a3b2-5af61ceb1a7d', '0d535ead-77e5-4c8a-b01b-a703aea88eae'],
  })
  @IsArray()
  @ArrayMaxSize(3)
  @IsNotEmpty({ each: true, message: 'Invalid donation project id' })
  @ValidateIf((o) => !o.nonprofit || o.nonprofit.length === 0)
  donation_projects?: string[]

  @ApiProperty({
    type: 'enum',
    enum: Object.values(IntegrationPayloadStatus),
    default: IntegrationPayloadStatus.DISABLED,
    description: 'Integration status',
  })
  @IsNotEmpty()
  @IsEnum(IntegrationPayloadStatus)
  readonly status: IntegrationPayloadStatus
}
