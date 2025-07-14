import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, MaxLength, IsUrl } from 'class-validator'
import { Type } from 'class-transformer'

export class BrandTokenDetailsDto {
  @ApiProperty({
    description: 'Name of the brand token',
    example: 'MyBrand Token',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Token name is required' })
  @IsString()
  @MaxLength(50, { message: 'Token name cannot exceed 50 characters' })
  readonly name: string

  @ApiProperty({
    description: 'Symbol of the brand token',
    example: 'MBT',
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'Token symbol is required' })
  @IsString()
  @MaxLength(10, { message: 'Token symbol cannot exceed 10 characters' })
  readonly symbol: string

  @ApiProperty({
    description: 'Total supply of the brand token',
    example: 1000000,
  })
  @IsNotEmpty({ message: 'Total supply is required' })
  @IsNumber()
  @Min(1, { message: 'Total supply must be greater than 0' })
  @Type(() => Number)
  readonly total_supply: number

  @ApiProperty({
    description: 'Description of the brand token',
    example: 'Official token for MyBrand ecosystem',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  readonly description?: string

  @ApiPropertyOptional({
    description: 'Logo of the brand token',
    example: '1c234567-89ab-cdef-0123-456789abcdef',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255, { message: 'Logo URL cannot exceed 255 characters' })
  readonly logo?: string

  @ApiPropertyOptional({
    description: 'Website URL of the brand',
    example: 'https://mybrand.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255, { message: 'Website URL cannot exceed 255 characters' })
  readonly website?: string

  @ApiPropertyOptional({
    description: 'Social media links',
    example: {
      twitter: 'https://twitter.com/mybrand',
      telegram: 'https://t.me/mybrand',
    },
  })
  @IsOptional()
  readonly social_links?: Record<string, string>
}
