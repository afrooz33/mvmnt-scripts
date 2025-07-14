import {
  IsEnum,
  IsEmail,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  IsDateString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ShippingCoveredBy } from '@app/src/users/deal/enums'
import { TopicType, SubTopicType, FrequencyOfOccurrence } from '@app/src/users/contact/enums'

export class CreateContactDto {
  @ApiProperty({
    description: 'Main topic of the contact',
    enum: Object.values(TopicType),
    nullable: false,
    default: TopicType.FOR_BEGINNERS,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly topic: TopicType

  @ApiProperty({
    description: 'Sub-topic of the contact',
    enum: Object.values(SubTopicType),
    nullable: false,
    default: SubTopicType.FOR_BEGINNERS,
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic !== TopicType.OTHER)
  readonly sub_topic: SubTopicType

  @ApiProperty({
    description: 'Email address',
    required: true,
  })
  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  readonly email: string

  @ApiPropertyOptional({
    description: 'Order name',
  })
  @IsOptional()
  readonly order_name: string

  @ApiPropertyOptional({
    description: 'Product name or id',
  })
  @IsOptional()
  readonly product_name: string

  @ApiProperty({
    description: 'Message to the support team',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly message: string

  @ApiPropertyOptional({
    description: 'Deal id',
    example: '450ae915-1c67-4a7c-96ea-209966a1f179',
    format: 'uuid',
  })
  @IsOptional()
  readonly deal: string

  @ApiPropertyOptional({
    description: 'Cart id',
    example: '450ae915-1c67-4a7c-96ea-209966a1f179',
    format: 'uuid',
  })
  @IsOptional()
  @ValidateIf((o) => o.topic === TopicType.ORDER_RELATED && !o.bid)
  readonly cart: string

  @ApiPropertyOptional({
    description: 'Payment id',
    example: '450ae915-1c67-4a7c-96ea-209966a1f179',
    format: 'uuid',
  })
  @IsOptional()
  @ValidateIf((o) => o.topic === TopicType.ORDER_RELATED)
  readonly payment: string

  @ApiPropertyOptional({
    description: 'Bid id',
    example: '450ae915-1c67-4a7c-96ea-209966a1f179',
    format: 'uuid',
  })
  @IsOptional()
  @ValidateIf((o) => o.topic === TopicType.ORDER_RELATED && !o.cart)
  readonly bid: string

  @ApiPropertyOptional({
    description: 'Receiver user id',
    example: '0335eaf3-e2f3-4407-9704-423584d4e0e0',
  })
  @IsOptional()
  readonly receiver?: string

  @ApiPropertyOptional({
    description: 'Attachments',
    example: ['l9qUYwzPA95QEFXzQ1y9a60Ud'],
  })
  @IsArray()
  @IsOptional()
  readonly attachment: string[]

  @ApiProperty({
    type: 'enum',
    description: 'Buyer or seller',
    enum: Object.values(ShippingCoveredBy),
    default: ShippingCoveredBy.BUYER,
  })
  @IsEnum(ShippingCoveredBy)
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf(
    (o) => o.topic === TopicType.ABOUT_PROBLEM || o.topic === TopicType.ABOUT_SHIPPING_REVIEW,
  )
  readonly user_type: string

  @ApiProperty({
    description: 'Date and time of occurrence',
    type: Date,
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  @ValidateIf((o) => o.topic === TopicType.REPORT_BUG)
  readonly date_of_occurrence: Date

  @ApiProperty({
    description: 'Frequency of occurrence',
    enum: Object.values(FrequencyOfOccurrence),
    default: FrequencyOfOccurrence.EVERYTIME,
  })
  @IsEnum(FrequencyOfOccurrence)
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic === TopicType.REPORT_BUG)
  readonly frequency_of_occurrence: string

  @ApiProperty({
    description: 'Detail of the issue',
    example: 'I have an issue with my order',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic === TopicType.REPORT_BUG)
  readonly issue_detail: string

  @ApiProperty({
    description: 'Message displayed during issue',
    example: 'I have an issue with my order',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic === TopicType.REPORT_BUG)
  readonly issue_message: string

  @ApiProperty({
    description: 'Reason for account deleting',
    example: 'I have an issue with my order',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic === TopicType.DELETE_ACCOUNT)
  readonly account_deleting_reason: string

  @ApiProperty({
    description: 'Detailed reason for account deleting',
    example: 'I have an issue with my order',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic === TopicType.DELETE_ACCOUNT)
  readonly account_deleting_reason_detail: string

  @ApiProperty({
    description: 'Forfeit sales on account deleting',
    type: Boolean,
    default: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic === TopicType.DELETE_ACCOUNT)
  readonly account_deleting_forfeit_sales: boolean

  @ApiProperty({
    description: 'Confirmation of account deleting',
    type: Boolean,
    default: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.topic === TopicType.DELETE_ACCOUNT)
  readonly account_deleting_confirmation: boolean
}
