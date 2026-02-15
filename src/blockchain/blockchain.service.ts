import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { UsersService } from '../users/users.service'
import { DreamsService } from '../dreams/dreams.service'
import { DonationsService } from '../donations/donations.service'

@Injectable()
export class BlockchainService {
  private provider: ethers.Provider
  private contract: ethers.Contract
  private logger = new Logger(BlockchainService.name)

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private dreamsService: DreamsService,
    private donationsService: DonationsService,
  ) {
    this.initializeProvider()
  }

  private initializeProvider() {
    const rpcUrl = this.configService.get<string>('ETH_RPC_URL')
    if (!rpcUrl) {
      this.logger.warn('ETH_RPC_URL not configured')
      return
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl)
  }

  async verifyDonation(txHash: string) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash)
      if (!receipt) return null

      const transaction = await this.provider.getTransaction(txHash)
      
      return {
        txHash: receipt.hash,
        from: receipt.from,
        value: transaction?.value.toString() || '0',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      }
    } catch (error) {
      this.logger.error(`Error verifying donation: ${error}`)
      return null
    }
  }

  async getBalance(address: string) {
    try {
      const balance = await this.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      this.logger.error(`Error getting balance: ${error}`)
      return null
    }
  }

  async getUserDonationCount(userAddress: string) {
    try {
      const donations = await this.donationsService.findByWallet(userAddress)
      return donations.length
    } catch (error) {
      this.logger.error(`Error getting donation count: ${error}`)
      return 0
    }
  }

  async canUserCreateDream(userAddress: string): Promise<boolean> {
    // User can create dream if they have made at least 1 donation
    const donationCount = await this.getUserDonationCount(userAddress)
    return donationCount > 0
  }
}
