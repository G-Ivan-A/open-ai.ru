import express from 'express';
import { createSession, getSession, destroySession, listSessions } from '../controllers/sessionController.js';
import { validate, createSessionSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/sessions
 * @desc    Create a new sandbox session
 * @access  Public
 */
router.post('/', validate(createSessionSchema), createSession);

/**
 * @route   GET /api/sessions/:sessionId
 * @desc    Get session information
 * @access  Public
 */
router.get('/:sessionId', getSession);

/**
 * @route   DELETE /api/sessions/:sessionId
 * @desc    Destroy a sandbox session
 * @access  Public
 */
router.delete('/:sessionId', destroySession);

/**
 * @route   GET /api/sessions
 * @desc    List all active sessions
 * @access  Public
 */
router.get('/', listSessions);

export default router;
