import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { DreamsService } from './dreams.service'
import { DreamsController } from './dreams.controller'

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [DreamsController],
  providers: [DreamsService],
  exports: [DreamsService],
})
export class DreamsModule {}
