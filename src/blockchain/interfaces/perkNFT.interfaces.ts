import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsEthereumAddress,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator'

/**
 * =============================
 * PerkNFT Core Interface Types
 * =============================
 */

export interface PerkCore {
  brandId: string
  perkId: string
  expirationTime: string
  usageLimit: number
  isTransferable: boolean
}

export interface PerkDetails {
  discountAmount: string
  discountPercent: string
  maxUses: string
  usedCount: string
  duration: string
  name: string
  description: string
  tokenURI: string
}

export interface FullPerkInfo {
  core: PerkCore
  details: PerkDetails
}

/**
 * Response interfaces for NFT operations
 */
export interface MintPerkResponse {
  success: boolean
  tokenId: string | null
  transactionHash: string
  blockNumber: number
  gasUsed: string
  status: number
  brandId: string
  perkId: string
  recipient: string
}

export interface BurnPerkResponse {
  success: boolean
  tokenId: string
  transactionHash: string
  blockNumber: number
  gasUsed: string
  status: number
  action: 'burned'
}

export interface UsePerkResponse {
  success: boolean
  tokenId: string
  transactionHash: string
  blockNumber: number
  gasUsed: string
  status: number
  action: 'used'
  remainingUsesBefore: string
  remainingUsesAfter: string
}

export interface TransferPerkResponse {
  success: boolean
  tokenId: string
  from: string
  to: string
  amount: string
  transactionHash: string
  blockNumber: number
  gasUsed: string
  status: number
  action: 'transferred'
}

/**
 * =============================
 * DTO Classes for API Validation
 * =============================
 */

/**
 * DTO for minting a new perk NFT
 */
export class MintPerkNFTDto {
  @ApiProperty({
    description: 'Brand identifier',
    example: '257418421373294684415119313125885331597',
  })
  @IsString()
  @IsNotEmpty()
  brandId: string

  @ApiProperty({
    description: 'Perk identifier',
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  perkId: string

  @ApiProperty({
    description: 'Recipient wallet address',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @IsEthereumAddress()
  recipient: string

  @ApiProperty({
    description: 'Perk type (0-3)',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(3)
  perkType: number

  @ApiProperty({
    description: 'Discount type (0-2)',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  discountType: number

  @ApiProperty({
    description: 'Discount amount',
    example: '1000',
  })
  @IsString()
  discountAmount: string

  @ApiProperty({
    description: 'Discount percentage',
    example: '10',
  })
  @IsString()
  discountPercent: string

  @ApiProperty({
    description: 'Usage limit type (0=OneTime, 1=Limited, 2=Unlimited)',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  usageLimit: number

  @ApiProperty({
    description: 'Maximum uses (if limited)',
    example: '5',
  })
  @IsString()
  maxUses: string

  @ApiProperty({
    description: 'Duration in seconds',
    example: '86400',
  })
  @IsString()
  duration: string

  @ApiProperty({
    description: 'Whether NFT is transferable',
    example: true,
  })
  @IsBoolean()
  isTransferable: boolean

  @ApiProperty({
    description: 'Perk name',
    example: 'VIP Access Pass',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Perk description',
    example: 'Exclusive access to VIP events',
  })
  @IsString()
  description: string

  @ApiProperty({
    description: 'Token URI for metadata',
    example: 'ipfs://QmYourHashHere',
  })
  @IsString()
  tokenURI: string
}

/**
 * DTO for transferring perk NFT
 */
export class TransferPerkNFTDto {
  @ApiProperty({
    description: 'From address',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @IsEthereumAddress()
  from: string

  @ApiProperty({
    description: 'To address',
    example: '0x742d35Cc6629C0532C9E2A60f1e81C33DDE4e19A',
  })
  @IsEthereumAddress()
  to: string

  @ApiProperty({
    description: 'Token ID to transfer',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  tokenId: string

  @ApiProperty({
    description: 'Amount to transfer (always 1 for perks)',
    example: '1',
  })
  @IsString()
  amount: string

  @ApiPropertyOptional({
    description: 'Additional data (optional)',
    example: '0x',
  })
  @IsOptional()
  @IsString()
  data?: string
}

/**
 * DTO for setting approval for all
 */
export class SetApprovalDto {
  @ApiProperty({
    description: 'Operator address to approve',
    example: '0x742d35Cc6629C0532C9E2A60f1e81C33DDE4e19A',
  })
  @IsEthereumAddress()
  operator: string

  @ApiProperty({
    description: 'Approval status',
    example: true,
  })
  @IsBoolean()
  approved: boolean
}

/**
 * DTO for batch balance request
 */
export class BatchBalanceDto {
  @ApiProperty({
    description: 'Array of account addresses',
    example: [
      '0x45b95E19dCBB82574221A32CB83483A3278F737f',
      '0x742d35Cc6629C0532C9E2A60f1e81C33DDE4e19A',
    ],
  })
  @IsString({ each: true })
  @IsEthereumAddress({ each: true })
  accounts: string[]

  @ApiProperty({
    description: 'Array of token IDs',
    example: ['1', '2'],
  })
  @IsString({ each: true })
  tokenIds: string[]
}

/**
 * DTO for updating base URI
 */
export class UpdateBaseURIDto {
  @ApiProperty({
    description: 'New base URI',
    example: 'https://api.example.com/metadata/',
  })
  @IsString()
  @IsNotEmpty()
  baseURI: string
}

/**
 * DTO for updating perk manager
 */
export class UpdatePerkManagerDto {
  @ApiProperty({
    description: 'New perk manager address',
    example: '0x742d35Cc6629C0532C9E2A60f1e81C33DDE4e19A',
  })
  @IsEthereumAddress()
  perkManager: string
}

/**
 * DTO for using a perk NFT
 */
export class UsePerkDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @IsEthereumAddress()
  userWallet: string
}
