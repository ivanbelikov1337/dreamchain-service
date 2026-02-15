import { Controller, Get, Param, Post, Body } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'

@Controller('blockchain')
export class BlockchainController {
  constructor(private blockchainService: BlockchainService) {}

  @Post('verify-donation')
  async verifyDonation(@Body() body: { txHash: string }) {
    return this.blockchainService.verifyDonation(body.txHash)
  }

  @Get('balance/:address')
  async getBalance(@Param('address') address: string) {
    return {
      address,
      balance: await this.blockchainService.getBalance(address),
    }
  }

  @Get('can-create-dream/:address')
  async canCreateDream(@Param('address') address: string) {
    const can = await this.blockchainService.canUserCreateDream(address)
    return { address, canCreateDream: can }
  }

  @Get('donation-count/:address')
  async getDonationCount(@Param('address') address: string) {
    return {
      address,
      count: await this.blockchainService.getUserDonationCount(address),
    }
  }
}
