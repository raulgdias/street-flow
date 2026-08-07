import { Injectable } from '@nestjs/common';

@Injectable()
export class CircuitBreakerService {
  private readonly failures = new Map<string, number>();
  private readonly thresholds = new Map<string, number>();

  async execute<T>(key: string, action: () => Promise<T>): Promise<T> {
    const failures = this.failures.get(key) ?? 0;
    if (failures >= 3) {
      throw new Error(`Circuit breaker open for ${key}`);
    }

    try {
      const result = await action();
      this.failures.delete(key);
      this.thresholds.set(key, 0);
      return result;
    } catch (error) {
      this.failures.set(key, failures + 1);
      this.thresholds.set(key, (this.thresholds.get(key) ?? 0) + 1);
      throw error;
    }
  }
}
