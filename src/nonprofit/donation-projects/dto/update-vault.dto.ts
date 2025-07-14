import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UpdateVaultDto {
  @ApiProperty({
    description: 'Project ID from Blockchain',
    example: '0x5cc332e338f14ffa9290f51868df6fd01730966742625',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  readonly project_id: string

  @ApiProperty({
    description: 'Address of the newly created Vault',
    example: '0x97ce8f152f9d80f87d53ded177e7c89c02c4f197',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  readonly vault_address: string

  @ApiProperty({
    description: 'Timestamp used in signature',
    example: '1734685102985',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  readonly timestamp: number
}
