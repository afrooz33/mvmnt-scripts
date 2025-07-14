import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsArray, IsDefined, IsNotEmpty, ArrayMaxSize, ArrayMinSize } from 'class-validator'
import { HomepageTitle } from '@app/src/admin/homepages/enums'

export class CreateHomepageDto {
  @ApiProperty({
    description: 'Homepage title',
    nullable: false,
    type: 'enum',
    enum: Object.values(HomepageTitle),
    isArray: true,
  })
  @IsEnum(HomepageTitle, { each: true })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10, { message: 'Maximum of 10 homepages can be added' })
  readonly types: HomepageTitle[]
}
