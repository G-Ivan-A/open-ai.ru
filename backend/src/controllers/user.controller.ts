import { Response, NextFunction } from 'express';
import userService from '../services/user.service';
import reputationService from '../services/reputation.service';
import { AuthRequest, UpdateProfileDto } from '../types';
import { ApiError } from '../middleware/errorHandler';

export class UserController {
  // Get user profile by ID
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update current user profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const data: UpdateProfileDto = req.body;
      const updatedUser = await userService.updateProfile(userId, data);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get users by role
  async getUsersByRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await userService.getUsersByRole(role, page, limit);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user reputation history
  async getReputationHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await reputationService.getUserReputationHistory(id, page, limit);

      res.json({
        success: true,
        data: result.history,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get reputation leaderboard
  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as string | undefined;
      const limit = parseInt(req.query.limit as string) || 100;

      const leaderboard = await reputationService.getLeaderboard(role, limit);

      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user reputation statistics
  async getReputationStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await reputationService.getUserReputationStats(id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (admin or self)
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      // Check permissions
      if (!isAdmin && currentUserId !== id) {
        throw new ApiError(403, 'Forbidden: You can only delete your own account');
      }

      const result = await userService.deleteUser(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
