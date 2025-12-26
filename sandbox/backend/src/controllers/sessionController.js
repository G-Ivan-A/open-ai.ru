import dockerService from '../services/dockerService.js';
import logger from '../utils/logger.js';

/**
 * Create a new sandbox session
 */
export const createSession = async (req, res, next) => {
  try {
    const { agentType, metadata } = req.body;

    const session = await dockerService.createSession(agentType, metadata);

    logger.info(`Session created: ${session.sessionId} by IP: ${req.ip}`);

    res.status(201).json({
      success: true,
      data: session
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get session information
 */
export const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await dockerService.getSession(sessionId);

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Destroy a sandbox session
 */
export const destroySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    await dockerService.destroySession(sessionId);

    logger.info(`Session destroyed: ${sessionId} by IP: ${req.ip}`);

    res.json({
      success: true,
      message: 'Session destroyed successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * List all active sessions
 */
export const listSessions = async (req, res, next) => {
  try {
    const sessions = dockerService.listSessions();

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      }
    });

  } catch (error) {
    next(error);
  }
};
