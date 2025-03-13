import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'QJ**%O*^uLBxLE.'; // Replace with a secure key, ideally stored in environment variables

export class CryptoHelper {
  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  }

  static decrypt(ciphertext: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed', error);
      return null;
    }
  }
}
