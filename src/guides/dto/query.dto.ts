import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsUUID, IsDefined, IsNotEmpty, ValidateIf } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'
import { GuideLevel } from '@app/src/admin/guides/enums'

export class GuidesQueryDto extends MyPaginateDto {
  @ApiProperty({
    description: 'Guide level',
    enum: Object.values(GuideLevel),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(GuideLevel)
  readonly level: GuideLevel

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Parent guide id',
  })
  @IsUUID()
  @ValidateIf((o) => o.level === GuideLevel.MIDDLE || o.level === GuideLevel.ARTICLE)
  readonly parent: string
}
