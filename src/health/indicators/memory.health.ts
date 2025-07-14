import * as os from 'node:os'
import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult } from '@nestjs/terminus'

@Injectable()
export class MemoryHealthIndicator {
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
      const totalMemory = os.totalmem()
      const freeMemory = os.freemem()
      const usedMemory = totalMemory - freeMemory
      const memoryUsagePercent = (usedMemory / totalMemory) * 100

      // Check if memory usage is within acceptable limits (95% threshold)
      if (memoryUsagePercent > 95) {
        return this.getStatus(key, false, {
          message: `Memory usage critical: ${memoryUsagePercent.toFixed(2)}%`,
          total: this.formatBytes(totalMemory),
          used: this.formatBytes(usedMemory),
          free: this.formatBytes(freeMemory),
          usagePercent: `${memoryUsagePercent.toFixed(2)}%`,
          warning: 'Memory usage is critically high',
        })
      }

      // Warning threshold at 85%
      if (memoryUsagePercent > 85) {
        return this.getStatus(key, true, {
          message: `Memory usage high: ${memoryUsagePercent.toFixed(2)}%`,
          total: this.formatBytes(totalMemory),
          used: this.formatBytes(usedMemory),
          free: this.formatBytes(freeMemory),
          usagePercent: `${memoryUsagePercent.toFixed(2)}%`,
          warning: 'Memory usage is high - consider monitoring',
        })
      }

      return this.getStatus(key, true, {
        message: 'Memory usage is healthy',
        total: this.formatBytes(totalMemory),
        used: this.formatBytes(usedMemory),
        free: this.formatBytes(freeMemory),
        usagePercent: `${memoryUsagePercent.toFixed(2)}%`,
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        total: this.formatBytes(os.totalmem()),
        used: this.formatBytes(os.totalmem() - os.freemem()),
        free: this.formatBytes(os.freemem()),
      })
    }
  }

  async checkHeapMemory(key: string): Promise<HealthIndicatorResult> {
    try {
      const memUsage = process.memoryUsage()
      const heapUsed = memUsage.heapUsed
      const heapTotal = memUsage.heapTotal
      const heapUsagePercent = (heapUsed / heapTotal) * 100

      // Check if heap usage is within acceptable limits (98% threshold)
      if (heapUsagePercent > 98) {
        return this.getStatus(key, false, {
          message: `Heap memory usage critical: ${heapUsagePercent.toFixed(2)}%`,
          heapUsed: this.formatBytes(heapUsed),
          heapTotal: this.formatBytes(heapTotal),
          heapFree: this.formatBytes(heapTotal - heapUsed),
          usagePercent: `${heapUsagePercent.toFixed(2)}%`,
          external: this.formatBytes(memUsage.external),
          rss: this.formatBytes(memUsage.rss),
          warning: 'Heap memory usage is critically high',
        })
      }

      // Warning threshold at 90%
      if (heapUsagePercent > 90) {
        return this.getStatus(key, true, {
          message: `Heap memory usage high: ${heapUsagePercent.toFixed(2)}%`,
          heapUsed: this.formatBytes(heapUsed),
          heapTotal: this.formatBytes(heapTotal),
          heapFree: this.formatBytes(heapTotal - heapUsed),
          usagePercent: `${heapUsagePercent.toFixed(2)}%`,
          external: this.formatBytes(memUsage.external),
          rss: this.formatBytes(memUsage.rss),
          warning: 'Heap memory usage is high - consider monitoring',
        })
      }

      return this.getStatus(key, true, {
        message: 'Heap memory usage is healthy',
        heapUsed: this.formatBytes(heapUsed),
        heapTotal: this.formatBytes(heapTotal),
        heapFree: this.formatBytes(heapTotal - heapUsed),
        usagePercent: `${heapUsagePercent.toFixed(2)}%`,
        external: this.formatBytes(memUsage.external),
        rss: this.formatBytes(memUsage.rss),
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        heapUsed: this.formatBytes(process.memoryUsage().heapUsed),
        heapTotal: this.formatBytes(process.memoryUsage().heapTotal),
      })
    }
  }

  async checkMemoryLeak(key: string): Promise<HealthIndicatorResult> {
    try {
      const memUsage = process.memoryUsage()
      const rss = memUsage.rss
      const heapUsed = memUsage.heapUsed

      // Simple memory leak detection: if RSS is significantly larger than heap
      const rssToHeapRatio = rss / heapUsed

      if (rssToHeapRatio > 5) {
        // RSS should not be more than 5x heap (increased threshold)
        return this.getStatus(key, false, {
          message: `Potential memory leak detected: RSS/Heap ratio = ${rssToHeapRatio.toFixed(2)}`,
          rssToHeapRatio: rssToHeapRatio.toFixed(2),
          rss: this.formatBytes(rss),
          heapUsed: this.formatBytes(heapUsed),
          warning: 'RSS to Heap ratio is very high - potential memory leak',
        })
      }

      if (rssToHeapRatio > 3) {
        // Warning threshold
        return this.getStatus(key, true, {
          message: `RSS/Heap ratio elevated: ${rssToHeapRatio.toFixed(2)}`,
          rssToHeapRatio: rssToHeapRatio.toFixed(2),
          rss: this.formatBytes(rss),
          heapUsed: this.formatBytes(heapUsed),
          warning: 'RSS to Heap ratio is elevated - monitor for memory leaks',
        })
      }

      return this.getStatus(key, true, {
        message: 'No memory leak detected',
        rssToHeapRatio: rssToHeapRatio.toFixed(2),
        rss: this.formatBytes(rss),
        heapUsed: this.formatBytes(heapUsed),
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        rss: this.formatBytes(process.memoryUsage().rss),
        heapUsed: this.formatBytes(process.memoryUsage().heapUsed),
      })
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
