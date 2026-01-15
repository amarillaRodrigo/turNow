export interface CreateProfessionalInput {
    name: string;
    email: string;
}

export interface UpdateProfessionalInput {
    name?: string;
    email?: string;
}

export function validateCreateProfessional(data: unknown): CreateProfessionalInput {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input: must be an object');
  }

  const { name, email } = data as Record<string, unknown>;

  // Validar name
  if (!name || typeof name !== 'string') {
    throw new Error('name is required and must be a string');
  }
  if (name.trim().length < 3) {
    throw new Error('name must be at least 3 characters');
  }
  if (name.length > 255) {
    throw new Error('name must not exceed 255 characters');
  }

  // Validar email
  if (!email || typeof email !== 'string') {
    throw new Error('email is required and must be a string');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('email must be a valid email format');
  }
  if (email.length > 255) {
    throw new Error('email must not exceed 255 characters');
  }

  return {
    name: name.trim(),
    email: email.toLowerCase().trim(),
  };
}

/**
 * Valida la actualización de un profesional
 */
export function validateUpdateProfessional(data: unknown): UpdateProfessionalInput {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input: must be an object');
  }

  const input = data as Record<string, unknown>;
  const result: UpdateProfessionalInput = {};

  // Validar name opcional
  if (input.name !== undefined) {
    if (typeof input.name !== 'string') {
      throw new Error('name must be a string');
    }
    if (input.name.trim().length < 3) {
      throw new Error('name must be at least 3 characters');
    }
    if (input.name.length > 255) {
      throw new Error('name must not exceed 255 characters');
    }
    result.name = input.name.trim();
  }

  // Validar email opcional
  if (input.email !== undefined) {
    if (typeof input.email !== 'string') {
      throw new Error('email must be a string');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('email must be a valid email format');
    }
    if (input.email.length > 255) {
      throw new Error('email must not exceed 255 characters');
    }
    result.email = input.email.toLowerCase().trim();
  }

  if (Object.keys(result).length === 0) {
    throw new Error('At least one field must be provided for update');
  }

  return result;
}