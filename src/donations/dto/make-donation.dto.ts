import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator'
import { DonateTo, DonationFrequency, DonationMethod } from '@app/src/donations/enums'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

export class MakeDonationDto {
  @ValidateIf((o) => o.donate_to === DonateTo.NONPROFIT)
  @ApiPropertyOptional({
    description: 'Nonprofit user id',
    example: '7e6b4192-973a-4093-bfe9-7583eba762bc',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  nonprofit: NonprofitUserEntity

  @ValidateIf((o) => o.donate_to === DonateTo.DONATION_PROJECT)
  @ApiPropertyOptional({
    description: 'Donation project id',
    example: '7e6b4192-973a-4093-bfe9-7583eba762bc',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  donation_project: DonationProjectEntity

  @ApiProperty({
    description: 'Payment method ID',
    example: '99402d9a-f71f-48f2-adc3-9764d3c24e36',
    required: true,
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly payment_method: string

  @ApiProperty({
    description: 'Donation method',
    default: DonationMethod.CREDIT_CARD,
    required: true,
  })
  @IsEnum(DonationMethod)
  @IsNotEmpty()
  @IsDefined()
  readonly donation_method: DonationMethod

  @ApiProperty({
    description: 'Donation frequency',
    default: DonationFrequency.ONE_TIME,
    required: true,
  })
  @IsEnum(DonationFrequency)
  @IsNotEmpty()
  @IsDefined()
  readonly donation_frequency: DonationFrequency

  @ApiProperty({
    description: 'Donation amount',
    example: 199.99,
    required: true,
    type: 'decimal',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly amount: number
}
