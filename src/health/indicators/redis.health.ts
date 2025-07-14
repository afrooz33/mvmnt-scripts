import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult } from '@nestjs/terminus'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject } from '@nestjs/common'

@Injectable()
export class RedisHealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: any) {}

  private getStatus(key: string, isHealthy: boolean, data: any): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data,
      },
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if Redis is connected by performing a simple operation
      const testKey = 'health_check_' + Date.now()
      const testValue = 'test_value'

      await this.cacheManager.set(testKey, testValue, 10) // 10 seconds TTL
      const retrievedValue = await this.cacheManager.get(testKey)

      if (retrievedValue !== testValue) {
        return this.getStatus(key, false, {
          message: 'Redis read/write test failed',
        })
      }

      // Clean up test key
      await this.cacheManager.del(testKey)

      return this.getStatus(key, true, {
        message: 'Redis is healthy',
        status: 'connected',
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }

  async checkPerformance(key: string): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now()

      // Perform multiple operations to test performance
      const operations = []
      for (let i = 0; i < 10; i++) {
        operations.push(this.cacheManager.set(`perf_test_${i}`, `value_${i}`, 60))
      }

      await Promise.all(operations)

      const operationTime = Date.now() - startTime

      if (operationTime > 1000) {
        // 1 second threshold
        return this.getStatus(key, false, {
          message: `Redis performance degraded: ${operationTime}ms`,
          operationTime: `${operationTime}ms`,
        })
      }

      // Clean up test keys
      for (let i = 0; i < 10; i++) {
        await this.cacheManager.del(`perf_test_${i}`)
      }

      return this.getStatus(key, true, {
        message: 'Redis performance is good',
        operationTime: `${operationTime}ms`,
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        operationTime: 'timeout',
      })
    }
  }
}
