import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { DonationsService } from './donations.service'
import { CreateDonationDto, RecordBlockchainDonationDto } from './dto/create-donation.dto'

@Controller('donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Post()
  async create(@Body() dto: CreateDonationDto | RecordBlockchainDonationDto) {
    console.log(
      `\n📨 [Controller] POST /donations received\n` +
      `   Body: ${JSON.stringify(dto, null, 2)}`
    )
    try {
      // Check if this is a blockchain donation (has 'donor' field) or regular (has 'donorId')
      if ('donor' in dto && !('donorId' in dto)) {
        console.log(`🔄 [Controller] Dispatching to recordBlockchainDonation()`)
        return await this.donationsService.recordBlockchainDonation(dto as RecordBlockchainDonationDto)
      } else {
        console.log(`🔄 [Controller] Dispatching to create()`)
        return await this.donationsService.create(dto as CreateDonationDto)
      }
    } catch (error) {
      console.error(
        `❌ [Controller] Error processing donation:\n` +
        `   ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }

  @Post('blockchain')
  recordBlockchainDonation(@Body() recordDonationDto: RecordBlockchainDonationDto) {
    return this.donationsService.recordBlockchainDonation(recordDonationDto)
  }

  @Get()
  findAll(@Query('skip') skip = '0', @Query('take') take = '10') {
    return this.donationsService.findAll(parseInt(skip), parseInt(take))
  }

  @Get('dream/:dreamId')
  findByDreamId(@Param('dreamId') dreamId: string) {
    return this.donationsService.findByDreamId(parseInt(dreamId, 10))
  }

  @Get('wallet/:address')
  findByWallet(@Param('address') address: string) {
    return this.donationsService.findByWallet(address)
  }

  @Get('tx/:txHash')
  findByTxHash(@Param('txHash') txHash: string) {
    return this.donationsService.findByTxHash(txHash)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.donationsService.findById(parseInt(id, 10))
  }
}
