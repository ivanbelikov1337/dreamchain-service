import { IsNumber, IsString, IsOptional } from 'class-validator'

export class CreateDonationDto {
  @IsNumber()
  dreamId: number

  @IsString()
  fromWallet: string

  @IsNumber()
  @IsOptional()
  donorId?: number

  @IsNumber()
  amount: number

  @IsString()
  @IsOptional()
  currency?: string

  @IsString()
  txHash: string

  @IsNumber()
  @IsOptional()
  blockNumber?: number
}

/**
 * DTO for recording donations from blockchain
 * Flexible format for frontend
 */
export class RecordBlockchainDonationDto {
  @IsString()
  dreamId: string

  @IsString()
  amount: string

  @IsString()
  txHash: string

  @IsString()
  donor: string

  @IsString()
  @IsOptional()
  currency?: string
}
