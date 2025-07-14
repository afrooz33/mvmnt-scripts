import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  Matches,
} from 'class-validator'

/**
 * Enum definitions for perk types
 */
export enum PerkType {
  DISCOUNT = 0,
  COUPON = 1,
  SPECIAL = 2,
  PREMIUM = 3,
}

/**
 * Enum definitions for perk status
 */
export enum PerkStatus {
  NOT_EXIST = 0,
  ACTIVE = 1,
  INACTIVE = 2,
  EXPIRED = 3,
}

/**
 * =============================
 * Core Contract Interface Types
 * =============================
 */

/**
 * Parameters for creating a perk on the blockchain
 */
export interface PerkCreationParams {
  brandId: string
  name: string
  description: string
  perkType: number
  minHoldingAmount: string
  minHoldingDuration: string
  startTime: string
  endTime: string
  requiresStaking: boolean
  requiresLPStaking: boolean
}

/**
 * Configuration parameters for NFT perks
 */
export interface NFTPerkConfig {
  perkType: number
  discountAmount: string
  discountPercent: string
  maxUses: string
  duration: string
  transferable: boolean
}

/**
 * Parameters for updating a perk's status
 */
export interface PerkUpdateStatusParams {
  brandId: string
  perkId: string
  status: number
}

/**
 * Parameters for updating a perk's information
 */
export interface PerkUpdateInfoParams {
  brandId: string
  perkId: string
  name: string
  description: string
  perkType: number
}

/**
 * Parameters for updating a perk's requirements
 */
export interface PerkUpdateRequirementsParams {
  brandId: string
  perkId: string
  minHoldingAmount: string
  minHoldingDuration: string
  startTime: string
  endTime: string
  requiresStaking: boolean
  requiresLPStaking: boolean
}

/**
 * Parameters for claiming a perk
 */
export interface PerkClaimParams {
  brandId: string
  perkId: string
  userAddress: string
}

/**
 * Response from perk creation/update operations
 */
export interface PerkResponse {
  perkId: string
  transactionHash?: string
}

/**
 * Detailed information about a perk
 */
export interface PerkDetailsResponse {
  brandId: string
  name: string
  description: string
  perkType: number
  minHoldingAmount: string
  minHoldingDuration: string
  startTime: string
  endTime: string
  status: number
  requiresStaking: boolean
  requiresLPStaking: boolean
}

/**
 * Full details of a perk including derived properties
 */
export interface PerkDetails {
  brandId: string
  perkId: string
  perkType: number
  name: string
  description: string
  requirements: {
    minHoldingAmount: string
    minHoldingDuration: string
    requiresStaking: boolean
    requiresLPStaking: boolean
  }
  active: boolean
  startDate: Date
  endDate: Date
  maxClaims: number
  claimedCount: number
  isNFT?: boolean
  tokenURI?: string
  maxSupply?: number
  transferable?: boolean
}

/**
 * =============================
 * Data Transfer Objects (DTOs)
 * =============================
 */

/**
 * DTO for creating a new perk
 */
export class CreatePerkDto {
  @ApiProperty({
    description: 'Brand ID as numeric string (uint256)',
    example: '257418421373294684415119313125885331597',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'brandId must be a numeric string representing a uint256' })
  brandId: string

  @ApiProperty({
    description: 'Name of the perk',
    example: 'Early Access Discount',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Description of the perk',
    example: 'Get 20% off on all products for token holders',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'Perk type (0: Discount, 1: Coupon, 2: Special, 3: Premium)',
    enum: PerkType,
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(3)
  perkType: number

  @ApiProperty({
    description: 'Minimum token holding amount required',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  minHoldingAmount: number

  @ApiProperty({
    description: 'Minimum holding duration in seconds',
    example: 2592000, // 30 days
  })
  @IsNumber()
  @Min(0)
  minHoldingDuration: number

  @ApiProperty({
    description: 'Start time as Unix timestamp',
    example: 1672531200, // Jan 1, 2023
  })
  @IsNumber()
  @Min(0)
  startTime: number

  @ApiProperty({
    description: 'End time as Unix timestamp',
    example: 1704067200, // Jan 1, 2024
  })
  @IsNumber()
  @Min(0)
  endTime: number

  @ApiProperty({
    description: 'Whether staking is required to be eligible',
    example: false,
  })
  @IsBoolean()
  requiresStaking: boolean

  @ApiProperty({
    description: 'Whether LP token staking is required to be eligible',
    example: false,
  })
  @IsBoolean()
  requiresLPStaking: boolean
}

/**
 * DTO for NFT perk configuration
 */
export class NFTPerkConfigDto {
  @ApiProperty({
    description: 'URI for the NFT metadata',
    example: 'ipfs://Qm...',
  })
  @IsString()
  @IsNotEmpty()
  tokenURI: string

  @ApiProperty({
    description: 'Maximum supply of NFTs',
    example: 1000,
  })
  @IsNumber()
  @Min(1)
  maxSupply: number

  @ApiProperty({
    description: 'Whether the NFT is transferable',
    example: true,
  })
  @IsBoolean()
  transferable: boolean

  @ApiProperty({
    description: 'Specific perk type for NFT',
    enum: PerkType,
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(3)
  perkType?: number = 0

  @ApiProperty({
    description: 'Discount amount in smallest unit (if applicable)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  discountAmount: number = 1

  @ApiProperty({
    description: 'Discount percentage (0-100, if applicable)',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number = 0

  @ApiProperty({
    description: 'Duration in seconds for the NFT perk validity',
    example: 86400, // 1 day
    required: false,
  })
  @IsNumber()
  @Min(1)
  duration: number = 86400 // Default to 1 day (86400 seconds)
}

/**
 * DTO for updating a perk's status
 */
export class UpdatePerkStatusDto {
  @ApiProperty({
    description: 'Brand ID as numeric string (uint256)',
    example: '257418421373294684415119313125885331597',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'brandId must be a numeric string representing a uint256' })
  brandId: string

  @ApiProperty({
    description: 'Perk ID as numeric string (uint256)',
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'perkId must be a numeric string representing a uint256' })
  perkId: string

  @ApiProperty({
    description: 'New active status for the perk (boolean)',
    example: true,
  })
  @IsBoolean()
  active: boolean

  @ApiProperty({
    description: 'Numeric status value (1=active, 2=inactive, 3=expired)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(3)
  status?: number
}

/**
 * DTO for updating a perk's information
 */
export class UpdatePerkInfoDto {
  @ApiProperty({
    description: 'Brand ID as numeric string (uint256)',
    example: '257418421373294684415119313125885331597',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'brandId must be a numeric string representing a uint256' })
  brandId: string

  @ApiProperty({
    description: 'Perk ID as numeric string (uint256)',
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'perkId must be a numeric string representing a uint256' })
  perkId: string

  @ApiProperty({
    description: 'New name for the perk',
    example: 'Updated Discount Perk',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'New description for the perk',
    example: 'Updated description for the discount perk',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'New perk type',
    enum: PerkType,
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(3)
  perkType: number
}

/**
 * DTO for updating a perk's requirements
 */
export class UpdatePerkRequirementsDto {
  @ApiProperty({
    description: 'Brand ID as numeric string (uint256)',
    example: '257418421373294684415119313125885331597',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'brandId must be a numeric string representing a uint256' })
  brandId: string

  @ApiProperty({
    description: 'Perk ID as numeric string (uint256)',
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'perkId must be a numeric string representing a uint256' })
  perkId: string

  @ApiProperty({
    description: 'Minimum token holding amount required',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  minHoldingAmount: number

  @ApiProperty({
    description: 'Minimum holding duration in seconds',
    example: 2592000, // 30 days
  })
  @IsNumber()
  @Min(0)
  minHoldingDuration: number

  @ApiProperty({
    description: 'Start time as Unix timestamp',
    example: 1672531200, // Jan 1, 2023
  })
  @IsNumber()
  @Min(0)
  startTime: number

  @ApiProperty({
    description: 'End time as Unix timestamp',
    example: 1704067200, // Jan 1, 2024
  })
  @IsNumber()
  @Min(0)
  endTime: number

  @ApiProperty({
    description: 'Whether staking is required to be eligible',
    example: false,
  })
  @IsBoolean()
  requiresStaking: boolean

  @ApiProperty({
    description: 'Whether LP token staking is required to be eligible',
    example: false,
  })
  @IsBoolean()
  requiresLPStaking: boolean
}

/**
 * DTO for claiming a perk
 */
export class ClaimPerkDto {
  @ApiProperty({
    description: 'Brand ID as numeric string (uint256)',
    example: '257418421373294684415119313125885331597',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'brandId must be a numeric string representing a uint256' })
  brandId: string

  @ApiProperty({
    description: 'Perk ID as numeric string (uint256)',
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'perkId must be a numeric string representing a uint256' })
  perkId: string

  @ApiProperty({
    description: 'Ethereum address of the user claiming the perk',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'userAddress must be a valid Ethereum address' })
  userAddress: string
}
