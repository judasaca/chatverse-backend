import crypto from 'node:crypto';
export const generateHash = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('base64');
};
