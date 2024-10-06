import { TIMEOUT } from '../constants/code';

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retryCount = 2,
  timeoutMs = 6000
): Promise<T> {
  async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject({ code: TIMEOUT, message: 'Request timed out' });
      }, timeoutMs);

      promise
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  for (let i = 0; i < retryCount; i++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (error) {
      if (i < retryCount - 1) {
        console.log(`Retrying... attempts left: ${retryCount - i - 1}`);
      } else {
        throw error;
      }
    }
  }

  throw new Error('Failed after maximum retries');
}
