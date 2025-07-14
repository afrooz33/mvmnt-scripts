import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsUUID } from 'class-validator'
import { NotificationType } from '@app/src/notifications/enums'

export class CreateNotificationDto {
  @ApiProperty({
    type: String,
    description: 'Title of the notification',
    example: 'New notification',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly title: string

  @ApiProperty({
    type: 'enum',
    description: 'Type of the notification',
    enum: NotificationType,
    default: NotificationType.BID_ON_AUCTION,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  @IsDefined()
  readonly type: string

  @ApiProperty({
    type: Object,
    description: 'Data of the notification',
    example: {
      deal: '5f9d3b3b-1b7a-4f6a-8f0a-0b9b0b7b0b7b',
      deal_name: 'Auction deal title',
    },
  })
  @IsNotEmpty()
  @IsDefined()
  readonly data: any

  @ApiProperty({
    type: String,
    description: 'User id of the notification',
    example: '5f9d3b3b-1b7a-4f6a-8f0a-0b9b0b7b0b7b',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsUUID()
  readonly userId: string
}
