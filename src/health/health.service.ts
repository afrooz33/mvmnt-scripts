import { ConfigService } from '@nestjs/config'
import { Injectable, Logger } from '@nestjs/common'
import { HealthCheckResult } from '@nestjs/terminus'

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(private readonly configService: ConfigService) {}

  async getHealthStatus(): Promise<HealthCheckResult> {
    this.logger.log('Performing health check')

    return {
      status: 'ok',
      info: {
        app: {
          status: 'up',
          version: this.configService.get<string>('app.version', '1.0.0'),
          environment: this.configService.get<string>('NODE_ENV', 'development'),
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        },
      },
      error: {},
      details: {},
    }
  }

  async getDetailedHealth(): Promise<any> {
    const healthStatus = await this.getHealthStatus()

    return {
      ...healthStatus,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss,
        },
        cpu: process.cpuUsage(),
        pid: process.pid,
      },
      config: {
        environment: this.configService.get<string>('NODE_ENV'),
        port: this.configService.get<number>('app.port'),
        database: {
          host: this.configService.get<string>('TYPEORM_DB_HOST'),
          database: this.configService.get<string>('TYPEORM_DATABASE'),
        },
      },
    }
  }
}
