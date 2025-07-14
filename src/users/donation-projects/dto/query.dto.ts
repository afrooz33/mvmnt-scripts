import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsUUID, IsArray, IsOptional, ArrayMinSize } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { DonationProjectSearchFields } from '@app/src/shared/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { ProjectStatus } from '@app/src/users/donation-projects/enums'
import { DonationRangeProperty } from '@app/src/users/deal/dto/properties'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

export class QueryDto extends MySearchDto {
  constructor() {
    super(DonationProjectSearchFields)
  }

  @IsOptional()
  readonly includeIds?: string[]

  @ApiPropertyOptional({
    type: 'enum',
    enum: Object.values(ProjectStatus),
    name: 'status',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  readonly status?: ProjectStatus

  /**
   * Filter by tags
   * @example tags[]=tag1&tags[]=tag2
   * @example tags[]=tag1
   *
   * Do not need max array size limit
   */
  @ApiPropertyOptional({
    name: 'includeIds[tags][]',
    description: 'Filter by tags',
    isArray: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Invalid tags' })
  @ArrayMinSize(1)
  readonly tags?: TagEntity[]

  /**
   * Filter by nonprofit id
   * @example user[]=nonprofitUserId1&user[]=nonprofitUserId2
   * @example user[]=nonprofitUserId1
   *
   * Do not need max array size limit
   */
  @ApiPropertyOptional({
    name: 'includeIds[user][]',
    description: 'Filter by nonprofit id / charity id',
    isArray: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Invalid nonprofit user id' })
  @ArrayMinSize(1)
  readonly user?: NonprofitUserEntity[]

  @ApiPropertyOptional({
    description: 'Donation range',
    example: 100,
    type: DonationRangeProperty,
  })
  @IsOptional()
  readonly donation?: DonationRangeProperty
}
