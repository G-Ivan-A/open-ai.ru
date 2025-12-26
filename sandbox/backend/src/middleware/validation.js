import Joi from 'joi';

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

/**
 * Session creation validation schema
 */
export const createSessionSchema = Joi.object({
  agentType: Joi.string().required().valid('text-analysis').messages({
    'any.required': 'Agent type is required',
    'any.only': 'Invalid agent type'
  }),
  metadata: Joi.object().optional()
});

/**
 * Agent execution validation schema
 */
export const executeAgentSchema = Joi.object({
  input: Joi.string().required().max(10000).messages({
    'any.required': 'Input is required',
    'string.max': 'Input must not exceed 10000 characters'
  }),
  options: Joi.object({
    sentiment: Joi.boolean().optional(),
    keywords: Joi.boolean().optional(),
    summary: Joi.boolean().optional()
  }).optional()
});
