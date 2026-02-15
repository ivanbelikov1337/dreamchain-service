import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { DreamsModule } from './dreams/dreams.module'
import { DonationsModule } from './donations/donations.module'
import { AuthModule } from './auth/auth.module'
import { BlockchainModule } from './blockchain/blockchain.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DreamsModule,
    DonationsModule,
    BlockchainModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
