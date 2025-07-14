import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUUID, IsArray, IsString, IsNotEmpty, IsOptional, ArrayMaxSize } from 'class-validator'

export class CreateContactRequestDto {
  @ApiProperty({
    description: 'The ID of the UserDealPaymentEntity representing the order',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  order: string

  @ApiProperty({ description: 'Initial message from the buyer' })
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiPropertyOptional({
    description: 'Array of UUIDs referencing pre-uploaded images/PDFs from the Images table',
    type: [String],
    format: 'uuid',
    maxItems: 5,
  })
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each attachment must be a valid UUID' })
  @ArrayMaxSize(5)
  @IsOptional()
  attachments?: string[]
}
