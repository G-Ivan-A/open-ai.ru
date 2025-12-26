import express from 'express';
import { executeAgent } from '../controllers/agentController.js';
import { validate, executeAgentSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/agents/:sessionId/execute
 * @desc    Execute agent in sandbox session
 * @access  Public
 */
router.post('/:sessionId/execute', validate(executeAgentSchema), executeAgent);

export default router;
