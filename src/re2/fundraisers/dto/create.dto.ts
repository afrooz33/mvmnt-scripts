import { ApiProperty } from '@nestjs/swagger'
import {
  Max,
  Min,
  IsEnum,
  IsArray,
  IsNumber,
  IsDefined,
  IsBoolean,
  ValidateIf,
  IsHexColor,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  NotContains,
} from 'class-validator'
import {
  GoalSettings,
  FundraiserType,
  FundraiserPayloadStatus,
} from '@app/src/re2/fundraisers/enums'
import { DonationPreset } from '@app/src/nonprofit/profile/entities/properties'

function IsEndDateAfterStartDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEndDateAfterStartDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const start_date = args.object['start_date']
          if (start_date && value) {
            return value > start_date
          }

          return true
        },
      },
    })
  }
}

export class CreateFundraiserDto {
  @ApiProperty({
    description: 'Fundraiser page or form title',
    example: 'Help me raise funds',
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly title: string

  @ApiProperty({
    type: 'string',
    description: 'Fundraiser page or form public url',
  })
  @IsDefined()
  @IsNotEmpty()
  @NotContains(' ', {
    message: 'Public url must not contain spaces',
  })
  readonly public_url: string

  @ApiProperty({
    type: 'enum',
    enum: Object.values(FundraiserType),
    default: FundraiserType.FORM,
  })
  @IsEnum(FundraiserType)
  @IsNotEmpty()
  readonly type: FundraiserType

  @ApiProperty({
    type: [String],
    format: 'uuid',
    isArray: true,
    example: ['3b6927b5-3c4a-4406-ba70-507796abd0b0', 'a69e4766-0097-49cd-af35-3d86d73724c9'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true, message: 'Invalid image id' })
  @ValidateIf((o) => o.type === FundraiserType.PAGE)
  images?: string[]

  @ApiProperty({
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
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true, message: 'Invalid nonprofit id' })
  @ValidateIf((o) => !o.donation_projects || o.donation_projects.length === 0)
  nonprofit?: string[]

  @ApiProperty({
    type: [String],
    format: 'uuid',
    isArray: true,
    example: ['17c850ef-235b-4bb6-a3b2-5af61ceb1a7d', '0d535ead-77e5-4c8a-b01b-a703aea88eae'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true, message: 'Invalid donation project id' })
  @ValidateIf((o) => !o.nonprofit || o.nonprofit.length === 0)
  donation_projects?: string[]

  @ApiProperty({
    type: 'string',
    description: 'Fundraiser form hex color code',
    example: '#000000',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsHexColor()
  readonly hex_form_color: string

  @ApiProperty({
    type: 'string',
    description: 'Fundraiser page hex color code',
    example: '#000000',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsHexColor()
  @ValidateIf((o) => o.type === FundraiserType.PAGE)
  readonly hex_page_color: string

  @ApiProperty({
    description: 'Fundraiser page or form donation presets',
    type: [Number],
    minimum: 1,
    maximum: 5,
    example: [60, 60, 60, 60, 60],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  readonly donation_presets?: DonationPreset

  @ApiProperty({
    description: 'Fundraiser page or form default donation preset',
    default: 0,
  })
  @Min(0)
  @Max(4)
  @IsNumber()
  readonly default_donation_preset_amount?: number

  @ApiProperty({
    type: 'enum',
    enum: Object.values(GoalSettings),
    default: GoalSettings.DISABLED,
    description: 'Fundraiser goal settings',
  })
  @IsNotEmpty()
  @IsEnum(GoalSettings)
  @ValidateIf((o) => o.type === FundraiserType.PAGE)
  readonly goal_settings: GoalSettings

  @ApiProperty({
    type: 'number',
    description: 'Fundraiser goal amount',
    example: 1000,
  })
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.goal_settings === GoalSettings.ENABLED)
  readonly goal_amount?: number

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  @ValidateIf((o) => o.type === FundraiserType.PAGE)
  readonly start_date: Date

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  @ValidateIf((o) => o.start_date !== undefined && o.type === FundraiserType.PAGE)
  @IsEndDateAfterStartDate({
    message: 'End date must be after start date',
  })
  readonly end_date: Date

  @ApiProperty({
    description: 'Fundraiser page or form description',
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === FundraiserType.PAGE)
  readonly description: string

  @ApiProperty({
    description: 'Fundraiser page or form is hidden',
    type: 'boolean',
  })
  @IsDefined()
  @IsBoolean()
  @ValidateIf((o) => o.type === FundraiserType.PAGE)
  readonly is_hidden: boolean

  @ApiProperty({
    type: 'enum',
    enum: Object.values(FundraiserPayloadStatus),
    default: FundraiserPayloadStatus.DISABLED,
    description: 'Fundraiser form or page status',
  })
  @IsNotEmpty()
  @IsEnum(FundraiserPayloadStatus)
  readonly status: FundraiserPayloadStatus
}
