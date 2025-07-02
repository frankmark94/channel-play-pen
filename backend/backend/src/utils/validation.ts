import Joi from 'joi';
import { ValidationError } from '../types/api.js';

export const connectSchema = Joi.object({
  customer_id: Joi.string().required().min(1).max(100),
  jwt_secret: Joi.string().required().min(10),
  channel_id: Joi.string().required().min(1).max(100),
  api_url: Joi.string().uri().required()
});

export const sendMessageSchema = Joi.object({
  customer_id: Joi.string().required().min(1).max(100),
  message: Joi.string().required().min(1).max(10000),
  message_type: Joi.string().valid('text', 'rich_content').default('text'),
  metadata: Joi.object().optional()
});

export const endSessionSchema = Joi.object({
  customer_id: Joi.string().required().min(1).max(100),
  reason: Joi.string().optional().max(500)
});

export function validateRequest<T>(schema: Joi.ObjectSchema, data: unknown): { 
  isValid: boolean; 
  data?: T; 
  errors?: ValidationError[] 
} {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors: ValidationError[] = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return { isValid: false, errors };
  }
  
  return { isValid: true, data: value as T };
}