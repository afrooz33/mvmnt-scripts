import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  ArrayMaxSize,
  IsBoolean,
} from 'class-validator'

export class SellerReplyDto {
  @ApiProperty({
    description: 'Message content of the reply',
  })
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

  @ApiPropertyOptional({
    description: 'Set to true to close the contact request after sending this reply.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  close_request?: boolean
}
