import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult } from '@nestjs/terminus'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

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
      // Check if database is connected
      if (!this.dataSource.isInitialized) {
        return this.getStatus(key, false, {
          message: 'Database not initialized',
        })
      }

      // Perform a simple query to check connectivity
      const result = await this.dataSource.query('SELECT 1 as health_check')

      if (!result || result.length === 0) {
        return this.getStatus(key, false, {
          message: 'Database query failed',
        })
      }

      return this.getStatus(key, true, {
        message: 'Database is healthy',
        connectionStatus: 'connected',
        queryTime: Date.now(),
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }

  async checkQueryPerformance(key: string): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now()

      // Perform a more complex query to test performance
      await this.dataSource.query('SELECT COUNT(*) FROM information_schema.tables')

      const queryTime = Date.now() - startTime

      if (queryTime > 5000) {
        // 5 seconds threshold
        return this.getStatus(key, false, {
          message: `Query performance degraded: ${queryTime}ms`,
          queryTime: `${queryTime}ms`,
        })
      }

      return this.getStatus(key, true, {
        message: 'Database performance is good',
        queryTime: `${queryTime}ms`,
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        queryTime: 'timeout',
      })
    }
  }
}
