import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  CreateDonationDto,
  RecordBlockchainDonationDto,
} from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  /**
   * Calculate rating stars based on donation amount
   * 1-25: 1 star
   * 26-50: 2 stars
   * 51-100: 3 stars
   * 101-200: 4 stars
   * 201+: 5 stars (maximum)
   */
  private calculateRatingFromAmount(amount: number): number {
    if (amount <= 25) return 1;
    if (amount <= 50) return 2;
    if (amount <= 100) return 3;
    if (amount <= 200) return 4;
    return 5; // Maximum 5 stars
  }

  async create(createDonationDto: CreateDonationDto) {
    return this.prisma.donation.create({
      data: createDonationDto,
      include: {
        dream: true,
        donor: true,
      },
    });
  }

  /**
   * Record a donation from blockchain transaction
   */
  async recordBlockchainDonation(
    recordDonationDto: RecordBlockchainDonationDto,
  ) {
    const { dreamId, amount, txHash, donor, currency } = recordDonationDto;

    console.log(
      `\n📥 [Backend] Recording blockchain donation:\n` +
        `   Dream ID: ${dreamId}\n` +
        `   Amount: ${amount} ${currency}\n` +
        `   Donor: ${donor}\n` +
        `   TX Hash: ${txHash}`,
    );

    // Convert amount to number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount');
    }

    // Idempotency: ignore duplicate txHash submissions
    const existingDonation = await this.prisma.donation.findUnique({
      where: { txHash },
      include: {
        dream: true,
        donor: true,
      },
    });

    if (existingDonation) {
      console.log(
        `ℹ️ Donation with txHash ${txHash} already exists. Skipping duplicate.`,
      );
      return existingDonation;
    }

    // Check if dream exists
    console.log(`🔍 Checking if dream #${dreamId} exists in database...`);
    const dream = await this.prisma.dream.findUnique({
      where: { id: parseInt(dreamId) },
      include: { user: true },
    });

    if (!dream) {
      console.error(`❌ Dream #${dreamId} not found in database!`);
      throw new Error(`Dream with ID ${dreamId} does not exist in database`);
    }
    console.log(
      `✅ Dream found: "${dream.title}" (owner: ${dream.user.walletAddress})`,
    );

    // Check if dream is completed
    if (dream.status === 'COMPLETED') {
      console.error(`❌ Cannot donate to completed dream!`);
      throw new Error(`Dream with ID ${dreamId} is already completed`);
    }

    // Find or create donor user
    console.log(`🔍 Looking for donor user: ${donor}...`);
    let donorUser = await this.prisma.user.findUnique({
      where: { walletAddress: donor },
    });

    if (!donorUser) {
      console.log(`   Creating new donor user...`);
      donorUser = await this.prisma.user.create({
        data: {
          walletAddress: donor,
          rating: 0,
        },
      });
      console.log(`   ✅ Donor created: ID=${donorUser.id}`);
    } else {
      console.log(`   ✅ Donor found: ID=${donorUser.id}`);
    }

    // Create donation
    console.log(`✏️ Creating donation record...`);
    const donation = await this.prisma.donation.create({
      data: {
        dreamId: parseInt(dreamId),
        fromWallet: donor,
        donorId: donorUser.id,
        amount: amountNum,
        currency: currency || 'USDC',
        txHash,
      },
      include: {
        dream: true,
        donor: true,
      },
    });
    console.log(`✅ Donation created: ID=${donation.id}`);

    // Update dream totalDonations
    console.log(`📊 Updating dream statistics...`);
    const ratingIncrement = this.calculateRatingFromAmount(amountNum);
    await this.prisma.dream.update({
      where: { id: parseInt(dreamId) },
      data: {
        totalDonations: {
          increment: amountNum,
        },
        rating: {
          increment: ratingIncrement,
        },
      },
    });
    console.log(`⭐ Dream rating incremented by ${ratingIncrement} stars`);

    // Update donor statistics
    await this.prisma.user.update({
      where: { id: donorUser.id },
      data: {
        totalDonated: {
          increment: amountNum,
        },
      },
    });

    // Update donor's rating
    await this.usersService.updateRating(donorUser.id);

    // Update dream creator statistics if goal reached
    if (dream.totalDonations + amountNum >= dream.goal) {
      console.log(
        `🎉 Dream goal reached! Updating creator statistics and status...`,
      );
      await this.prisma.dream.update({
        where: { id: parseInt(dreamId) },
        data: {
          status: 'COMPLETED',
        },
      });
      await this.prisma.user.update({
        where: { id: dream.userId },
        data: {
          totalReceived: {
            increment: dream.goal,
          },
        },
      });

      // Update creator's rating
      await this.usersService.updateRating(dream.userId);
    }

    console.log(
      `✅ [Backend] Donation recorded successfully!\n` +
        `   Dream: "${dream.title}"\n` +
        `   Donor: ${donorUser.walletAddress}\n` +
        `   Amount: ${amountNum} ${currency}`,
    );

    return donation;
  }

  async findById(id: number) {
    return this.prisma.donation.findUnique({
      where: { id },
      include: {
        dream: true,
        donor: true,
      },
    });
  }

  async findByDreamId(dreamId: number) {
    return this.prisma.donation.findMany({
      where: { dreamId },
      include: {
        donor: true,
      },
    });
  }

  async findByWallet(fromWallet: string) {
    return this.prisma.donation.findMany({
      where: { fromWallet },
      include: {
        dream: true,
      },
    });
  }

  async findByTxHash(txHash: string) {
    return this.prisma.donation.findUnique({
      where: { txHash },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.donation.findMany({
      skip,
      take,
      include: {
        dream: true,
        donor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
