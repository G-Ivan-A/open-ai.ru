import dockerService from '../services/dockerService.js';
import logger from '../utils/logger.js';

/**
 * Execute agent in sandbox session
 */
export const executeAgent = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { input, options = {} } = req.body;

    logger.info(`Executing agent in session: ${sessionId}`);

    // Build command based on agent type and options
    const session = await dockerService.getSession(sessionId);

    let command;
    if (session.agentType === 'text-analysis') {
      // Command to run the text analysis agent
      const optionsStr = JSON.stringify(options);
      command = `/app/agent.sh "${optionsStr}"`;
    } else {
      throw new Error(`Unknown agent type: ${session.agentType}`);
    }

    // Execute in container
    const result = await dockerService.executeInSession(sessionId, command, input);

    // Parse result (assuming JSON output from agent)
    let parsedResult;
    try {
      // Clean the output - remove docker stream headers if present
      const cleanOutput = result.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
      const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = { output: cleanOutput };
      }
    } catch (parseError) {
      logger.warn(`Failed to parse agent output as JSON: ${parseError.message}`);
      parsedResult = { output: result };
    }

    logger.info(`Agent execution completed for session: ${sessionId}`);

    res.json({
      success: true,
      data: {
        sessionId,
        result: parsedResult,
        executedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    error.statusCode = error.message.includes('not found') ? 404 : 500;
    next(error);
  }
};
