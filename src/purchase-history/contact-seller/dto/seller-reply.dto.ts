import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { ReplyDto } from './reply.dto'

export class SellerReplyDto extends ReplyDto {
  @ApiPropertyOptional({
    description: 'Set to true to close the contact request after sending this reply.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  close_request?: boolean
}
