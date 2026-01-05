import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../utils/validation';

const router = Router();

// GET /api/users/profile/:id - Get user profile by ID
router.get('/profile/:id', userController.getProfile);

// PUT /api/users/profile - Update current user profile
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile
);

// GET /api/users/role/:role - Get users by role
router.get('/role/:role', userController.getUsersByRole);

// GET /api/users/:id/reputation - Get user reputation history
router.get('/:id/reputation', userController.getReputationHistory);

// GET /api/users/:id/reputation/stats - Get user reputation statistics
router.get('/:id/reputation/stats', userController.getReputationStats);

// GET /api/users/leaderboard - Get reputation leaderboard
router.get('/leaderboard', userController.getLeaderboard);

// DELETE /api/users/:id - Delete user (admin or self)
router.delete('/:id', authenticate, userController.deleteUser);

export default router;
