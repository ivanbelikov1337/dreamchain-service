import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto,
      include: {
        dreams: true,
        donations: {
          include: {
            dream: true,
          },
        },
        _count: {
          select: { donations: true },
        },
      },
    });

    // Update rating after creating user
    return this.updateRating(user.id);
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        dreams: true,
        donations: {
          include: {
            dream: true,
          },
        },
        _count: {
          select: { donations: true },
        },
      },
    });
  }

  async findByWalletAddress(walletAddress: string) {
    return this.prisma.user.findUnique({
      where: { walletAddress },
      include: {
        dreams: true,
        donations: {
          include: {
            dream: true,
          },
        },
        _count: {
          select: { donations: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { totalDonated: 'desc' },
      include: {
        dreams: {
          select: { id: true },
        },
      },
    });
  }

  async updateRating(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        dreams: {
          select: {
            id: true,
            totalDonations: true,
          },
        },
        donations: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!user) return null;

    const totalReceived = user.dreams.reduce(
      (sum, d) => sum + d.totalDonations,
      0,
    );
    const totalDonated = user.donations.reduce((sum, d) => sum + d.amount, 0);
    const dreamsCreated = user.dreams.length;

    const rating = Math.floor(
      totalDonated * 0.5 + totalReceived * 0.3 + dreamsCreated * 0.2,
    );

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        rating,
        totalDonated,
        totalReceived,
      },
      include: {
        dreams: true,
        donations: {
          include: {
            dream: true,
          },
        },
        _count: {
          select: { donations: true },
        },
      },
    });
  }

  async getCreatedDreams(walletAddress: string) {
    return this.prisma.dream.findMany({
      where: {
        user: {
          walletAddress,
        },
      },
      include: {
        user: true,
        donations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDonatedDreams(walletAddress: string) {
    return this.prisma.donation.findMany({
      where: {
        fromWallet: walletAddress,
      },
      include: {
        dream: {
          include: {
            user: true,
            donations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCompletedDreams(walletAddress: string) {
    return this.prisma.dream.findMany({
      where: {
        user: {
          walletAddress,
        },
        status: 'COMPLETED',
      },
      include: {
        user: true,
        donations: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateUsername(walletAddress: string, username: string) {
    return this.prisma.user.update({
      where: { walletAddress },
      data: { username },
      include: {
        dreams: true,
        donations: {
          include: {
            dream: true,
          },
        },
        _count: {
          select: { donations: true },
        },
      },
    });
  }
}
