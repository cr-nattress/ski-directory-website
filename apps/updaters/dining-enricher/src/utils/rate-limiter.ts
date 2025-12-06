export class RateLimiter {
  private lastRequestTime: number = 0;
  private minDelayMs: number;

  constructor(minDelayMs: number = 2000) {
    this.minDelayMs = minDelayMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const waitTime = Math.max(0, this.minDelayMs - elapsed);

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }
}
