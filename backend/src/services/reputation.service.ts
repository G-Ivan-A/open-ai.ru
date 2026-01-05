import prisma from '../utils/database';
import { AddReputationDto } from '../types';
import { ApiError } from '../middleware/errorHandler';

export class ReputationService {
  // Add reputation points to a user
  async addReputation(data: AddReputationDto) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Create reputation history entry and update user points in a transaction
    const result = await prisma.$transaction([
      prisma.reputationHistory.create({
        data: {
          userId: data.userId,
          points: data.points,
          reason: data.reason,
          sourceType: data.sourceType,
          sourceId: data.sourceId,
        },
      }),
      prisma.user.update({
        where: { id: data.userId },
        data: {
          reputationPoints: {
            increment: data.points,
          },
        },
      }),
    ]);

    return {
      historyEntry: result[0],
      updatedUser: result[1],
    };
  }

  // Get user reputation history
  async getUserReputationHistory(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.reputationHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reputationHistory.count({
        where: { userId },
      }),
    ]);

    return {
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get reputation leaderboard
  async getLeaderboard(role?: string, limit = 100) {
    const where = role ? { role: role as any, isActive: true } : { isActive: true };

    const users = await prisma.user.findMany({
      where,
      take: limit,
      orderBy: { reputationPoints: 'desc' },
      select: {
        id: true,
        name: true,
        role: true,
        reputationPoints: true,
        avatar: true,
      },
    });

    return users;
  }

  // Calculate reputation statistics for a user
  async getUserReputationStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputationPoints: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const [totalEarned, totalLost, recentActivity] = await Promise.all([
      prisma.reputationHistory.aggregate({
        where: { userId, points: { gt: 0 } },
        _sum: { points: true },
      }),
      prisma.reputationHistory.aggregate({
        where: { userId, points: { lt: 0 } },
        _sum: { points: true },
      }),
      prisma.reputationHistory.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      currentPoints: user.reputationPoints,
      totalEarned: totalEarned._sum.points || 0,
      totalLost: Math.abs(totalLost._sum.points || 0),
      recentActivity,
    };
  }
}

export default new ReputationService();
