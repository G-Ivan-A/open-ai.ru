import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });

class DockerService {
  constructor() {
    this.activeSessions = new Map();
    this.maxConcurrentSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 10;
  }

  /**
   * Create a new sandbox container session
   */
  async createSession(agentType, metadata = {}) {
    // Check concurrent session limit
    if (this.activeSessions.size >= this.maxConcurrentSessions) {
      throw new Error('Maximum concurrent sessions reached. Please try again later.');
    }

    const sessionId = uuidv4();
    const containerName = `sandbox-${agentType}-${sessionId}`;

    try {
      logger.info(`Creating sandbox session: ${sessionId} for agent: ${agentType}`);

      // Create container with security restrictions
      const container = await docker.createContainer({
        Image: process.env.SANDBOX_IMAGE || 'open-ai-ru/sandbox-agent:latest',
        name: containerName,
        Hostname: containerName,
        User: 'sandbox', // Run as non-root user
        Env: [
          `AGENT_TYPE=${agentType}`,
          `SESSION_ID=${sessionId}`,
          `METADATA=${JSON.stringify(metadata)}`
        ],
        HostConfig: {
          // Memory limit
          Memory: this.parseMemory(process.env.CONTAINER_MEMORY_LIMIT || '512m'),
          MemorySwap: this.parseMemory(process.env.CONTAINER_MEMORY_LIMIT || '512m'),

          // CPU limit
          NanoCpus: parseFloat(process.env.CONTAINER_CPU_LIMIT || 1) * 1e9,

          // Network isolation
          NetworkMode: process.env.SANDBOX_NETWORK || 'none',

          // Security options
          SecurityOpt: ['no-new-privileges'],
          CapDrop: ['ALL'],
          CapAdd: [], // No capabilities added
          ReadonlyRootfs: false, // Agent may need to write temporary files

          // Resource cleanup
          AutoRemove: true,

          // Prevent host access
          Binds: [], // No volume mounts from host

          // Limit processes
          PidsLimit: 100
        },

        // Networking disabled by default
        NetworkingConfig: {
          EndpointsConfig: {}
        },

        // Labels for identification
        Labels: {
          'sandbox.session.id': sessionId,
          'sandbox.agent.type': agentType,
          'sandbox.created.at': new Date().toISOString()
        }
      });

      await container.start();

      const session = {
        sessionId,
        containerId: container.id,
        containerName,
        agentType,
        createdAt: new Date(),
        status: 'active',
        metadata
      };

      this.activeSessions.set(sessionId, session);

      // Set timeout for automatic cleanup
      const timeout = parseInt(process.env.SESSION_TIMEOUT_MS) || 300000; // 5 minutes default
      setTimeout(() => {
        this.destroySession(sessionId).catch(err => {
          logger.error(`Failed to auto-cleanup session ${sessionId}: ${err.message}`);
        });
      }, timeout);

      logger.info(`Sandbox session created: ${sessionId}`);

      return {
        sessionId,
        agentType,
        createdAt: session.createdAt,
        expiresIn: timeout
      };

    } catch (error) {
      logger.error(`Failed to create sandbox session: ${error.message}`);
      throw new Error(`Failed to create sandbox: ${error.message}`);
    }
  }

  /**
   * Execute command in sandbox container
   */
  async executeInSession(sessionId, command, input) {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found or expired');
    }

    try {
      const container = docker.getContainer(session.containerId);

      // Create exec instance
      const exec = await container.exec({
        Cmd: ['sh', '-c', command],
        AttachStdout: true,
        AttachStderr: true,
        Tty: false,
        Env: [`INPUT=${Buffer.from(input).toString('base64')}`]
      });

      // Start exec with timeout
      const timeout = parseInt(process.env.CONTAINER_TIMEOUT_MS) || 60000; // 1 minute default

      const execPromise = new Promise(async (resolve, reject) => {
        try {
          const stream = await exec.start();
          let output = '';
          let error = '';

          stream.on('data', (chunk) => {
            const str = chunk.toString('utf8');
            if (str.includes('stderr')) {
              error += str;
            } else {
              output += str;
            }
          });

          stream.on('end', async () => {
            const inspect = await exec.inspect();

            if (inspect.ExitCode !== 0) {
              reject(new Error(error || 'Command execution failed'));
            } else {
              resolve(output);
            }
          });

        } catch (err) {
          reject(err);
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), timeout);
      });

      const result = await Promise.race([execPromise, timeoutPromise]);

      logger.info(`Command executed in session ${sessionId}`);
      return result;

    } catch (error) {
      logger.error(`Failed to execute in session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get session information
   */
  async getSession(sessionId) {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found or expired');
    }

    try {
      const container = docker.getContainer(session.containerId);
      const inspect = await container.inspect();

      return {
        sessionId: session.sessionId,
        agentType: session.agentType,
        status: inspect.State.Running ? 'active' : 'stopped',
        createdAt: session.createdAt,
        metadata: session.metadata
      };

    } catch (error) {
      logger.error(`Failed to get session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Destroy sandbox session
   */
  async destroySession(sessionId) {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return; // Already destroyed
    }

    try {
      logger.info(`Destroying sandbox session: ${sessionId}`);

      const container = docker.getContainer(session.containerId);

      // Stop and remove container
      await container.stop({ t: 5 }).catch(() => {}); // Ignore if already stopped
      await container.remove({ force: true }).catch(() => {});

      this.activeSessions.delete(sessionId);

      logger.info(`Sandbox session destroyed: ${sessionId}`);

    } catch (error) {
      logger.error(`Failed to destroy session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all active sessions
   */
  listSessions() {
    return Array.from(this.activeSessions.values()).map(session => ({
      sessionId: session.sessionId,
      agentType: session.agentType,
      createdAt: session.createdAt,
      status: session.status
    }));
  }

  /**
   * Parse memory string (e.g., "512m" to bytes)
   */
  parseMemory(memStr) {
    const units = {
      'k': 1024,
      'm': 1024 * 1024,
      'g': 1024 * 1024 * 1024
    };

    const match = memStr.toLowerCase().match(/^(\d+)([kmg]?)$/);
    if (!match) {
      throw new Error('Invalid memory format');
    }

    const value = parseInt(match[1]);
    const unit = match[2] || 'b';

    return value * (units[unit] || 1);
  }

  /**
   * Cleanup all sessions (for graceful shutdown)
   */
  async cleanupAll() {
    logger.info('Cleaning up all sandbox sessions');

    const promises = Array.from(this.activeSessions.keys()).map(sessionId =>
      this.destroySession(sessionId).catch(err => {
        logger.error(`Failed to cleanup session ${sessionId}: ${err.message}`);
      })
    );

    await Promise.all(promises);
  }
}

export default new DockerService();
