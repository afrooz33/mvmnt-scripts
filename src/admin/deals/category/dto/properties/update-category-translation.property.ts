import { IsDefined, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CategoryTranslation } from '@app/src/admin/deals/category/dto/properties/'

export class UpdateCategoryTranslation extends CategoryTranslation {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string
}
