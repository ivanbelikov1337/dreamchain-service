import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { DonationsService } from './donations.service'
import { DonationsController } from './donations.controller'

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
