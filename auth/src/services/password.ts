import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import generator from 'generate-password';
const scryptAsync = promisify(scrypt);
export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }
  static async compare(storedPassword: string, suplliedPassword: string) {
    const [hashPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suplliedPassword, salt, 64)) as Buffer;
    return buf.toString('hex') === hashPassword;
  }
  static generate() {
    const password = generator.generate({
      length: 5,
      numbers: true,
      symbols: false,
    });
    return password;
  }
}
