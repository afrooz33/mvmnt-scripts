import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsDateString, ValidateNested } from 'class-validator'
import { CreateAddressDto } from '@app/src/users/address/dto'
import { ProfileNameDto, IdentityDocuments } from './'

export class ProfileVerificationDto {
  @ApiProperty({
    description: 'User first and last name',
    nullable: false,
    type: () => ProfileNameDto,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly name: ProfileNameDto

  @ApiProperty({
    description: 'Birthday',
    type: 'string',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsDateString()
  readonly birthday: Date

  @ApiProperty({
    description: 'Address',
    type: () => CreateAddressDto,
  })
  @IsDefined()
  @IsNotEmpty({ each: true })
  addresses: CreateAddressDto

  @ApiProperty({
    description: 'Identity documents',
    type: () => IdentityDocuments,
  })
  @IsDefined()
  @IsNotEmpty()
  @Type(() => IdentityDocuments)
  @ValidateNested({ each: true })
  identity_documents: IdentityDocuments
}
