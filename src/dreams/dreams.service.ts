import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateDreamDto } from './dto/create-dream.dto';

@Injectable()
export class DreamsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(createDreamDto: CreateDreamDto) {
    const dream = await this.prisma.dream.create({
      data: createDreamDto,
      include: {
        user: true,
        donations: true,
      },
    });

    // Update creator's rating
    if (dream.userId) {
      await this.usersService.updateRating(dream.userId);
    }

    return dream;
  }

  async getNextId() {
    const result = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT nextval(pg_get_serial_sequence('dreams', 'id')) as id
    `;
    return result[0].id;
  }

  async findById(id: number) {
    return this.prisma.dream.findUnique({
      where: { id },
      include: {
        user: true,
        donations: true,
      },
    });
  }

  async findByUserId(userId: number) {
    return this.prisma.dream.findMany({
      where: { userId },
      include: {
        user: true,
        donations: true,
      },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.dream.findMany({
      skip,
      take,
      include: {
        user: true,
        _count: {
          select: { donations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [dreamsAggregate, donorGroups, completedDreamsCount] =
      await Promise.all([
        this.prisma.dream.aggregate({
          _count: { id: true },
          _sum: { totalDonations: true },
        }),
        this.prisma.donation.groupBy({
          by: ['fromWallet'],
        }),
        this.prisma.dream.count({
          where: { status: 'COMPLETED' },
        }),
      ]);

    return {
      totalDreams: dreamsAggregate._count.id || 0,
      totalRaised: dreamsAggregate._sum.totalDonations || 0,
      activeDonors: donorGroups.length,
      completedDreams: completedDreamsCount,
    };
  }

  async findTop(limit = 10) {
    return this.prisma.dream.findMany({
      take: limit,
      include: {
        user: true,
        _count: {
          select: { donations: true },
        },
      },
      orderBy: [{ rating: 'desc' }, { totalDonations: 'desc' }],
    });
  }

  async findNew(limit = 10) {
    return this.prisma.dream.findMany({
      take: limit,
      include: {
        user: true,
        _count: {
          select: { donations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRandom() {
    const dreams = await this.prisma.dream.findMany({
      include: {
        user: true,
        _count: {
          select: { donations: true },
        },
      },
    });

    if (dreams.length === 0) return null;
    return dreams[Math.floor(Math.random() * dreams.length)];
  }

  async updateTotalDonations(dreamId: number, amount: number) {
    return this.prisma.dream.update({
      where: { id: dreamId },
      data: {
        totalDonations: {
          increment: amount,
        },
      },
    });
  }

  async findCompleted(limit = 10) {
    return this.prisma.dream.findMany({
      where: {
        status: 'COMPLETED',
      },
      take: limit,
      include: {
        user: true,
        _count: {
          select: { donations: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async withdrawFunds(dreamId: number) {
    const dream = await this.prisma.dream.update({
      where: { id: dreamId },
      data: {
        isWithdrawn: true,
      },
      include: {
        user: true,
        donations: {
          include: {
            donor: true,
          },
        },
      },
    });

    // Update creator's rating
    if (dream.userId) {
      await this.usersService.updateRating(dream.userId);
    }

    // Update all donors' ratings
    const uniqueDonorIds = [
      ...new Set(
        dream.donations
          .filter(d => d.donorId)
          .map(d => d.donorId),
      ),
    ];
    for (const donorId of uniqueDonorIds) {
      if (donorId) {
        await this.usersService.updateRating(donorId);
      }
    }

    return dream;
  }
}
