import { Router } from 'express';
import applicationController from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createApplicationSchema, updateApplicationSchema } from '../utils/validation';

const router = Router();

// POST /api/applications - Create new application (authenticated users)
router.post(
  '/',
  authenticate,
  validate(createApplicationSchema),
  applicationController.createApplication
);

// GET /api/applications/my - Get current user's applications
router.get('/my', authenticate, applicationController.getMyApplications);

// GET /api/applications/statistics - Get statistics (admin only)
router.get(
  '/statistics',
  authenticate,
  authorize('ADMIN'),
  applicationController.getStatistics
);

// GET /api/applications - Get all applications (admin only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  applicationController.getAllApplications
);

// GET /api/applications/:id - Get application by ID
router.get('/:id', authenticate, applicationController.getApplication);

// PATCH /api/applications/:id - Update application status (admin only)
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateApplicationSchema),
  applicationController.updateApplicationStatus
);

// DELETE /api/applications/:id - Delete application
router.delete('/:id', authenticate, applicationController.deleteApplication);

export default router;
