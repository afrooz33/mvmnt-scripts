import { ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNotEmpty } from 'class-validator'

export class HomepageContentPropery {
  @ApiPropertyOptional({
    description: 'Brand id',
    example: '136adfc5-cacc-4646-88cd-a948726e9755',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly brand: string[]

  @ApiPropertyOptional({
    description: 'Brand id',
    example: '61cbfc5b-d36a-44c3-b023-9ee2d502e0a8',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly category: string[]

  @ApiPropertyOptional({
    description: 'Brand id',
    example: 'cc6361dd-591e-4eb8-acd9-87cf03584cc3',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly deal: string[]

  @ApiPropertyOptional({
    description: 'Brand id',
    example: 'cd0a2517-585e-4fa3-9001-e68335ad73fe',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly user: string[]
}
