import { IsEnum, IsArray, IsOptional, ArrayMaxSize, ArrayMinSize } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { NotificationRelatedTo } from '@app/src/notifications/enums'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    name: 'related_to[]',
    description: 'Related to',
    isArray: true,
    enum: Object.values(NotificationRelatedTo),
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(3)
  @ArrayMinSize(1)
  @IsEnum(NotificationRelatedTo, { each: true })
  readonly related_to?: NotificationRelatedTo[]
}
