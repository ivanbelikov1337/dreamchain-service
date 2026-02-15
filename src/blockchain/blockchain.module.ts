import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from '../users/users.module'
import { DreamsModule } from '../dreams/dreams.module'
import { DonationsModule } from '../donations/donations.module'
import { BlockchainService } from './blockchain.service'
import { BlockchainController } from './blockchain.controller'

@Module({
  imports: [ConfigModule, UsersModule, DreamsModule, DonationsModule],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
