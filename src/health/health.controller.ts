import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { HealthService } from './health.service'
import { DatabaseHealthIndicator } from './indicators/database.health'
import { RedisHealthIndicator } from './indicators/redis.health'
import { BlockchainHealthIndicator } from './indicators/blockchain.health'
import { MemoryHealthIndicator } from './indicators/memory.health'
import { DiskHealthIndicator } from './indicators/disk.health'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private healthService: HealthService,
    private databaseHealth: DatabaseHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private blockchainHealth: BlockchainHealthIndicator,
    private memoryHealth: MemoryHealthIndicator,
    private diskHealth: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Basic health check' })
  check() {
    return this.health.check([() => this.db.pingCheck('database')])
  }

  @Get('detailed')
  @HealthCheck()
  @ApiOperation({ summary: 'Detailed health check with all indicators' })
  async detailedCheck() {
    const checks = []

    // Always include basic database check
    checks.push(() => this.db.pingCheck('database'))

    // Add all health checks
    checks.push(() => this.databaseHealth.isHealthy('database_connection'))
    checks.push(() => this.databaseHealth.checkQueryPerformance('database_performance'))

    checks.push(() => this.redisHealth.isHealthy('redis'))
    checks.push(() => this.redisHealth.checkPerformance('redis_performance'))

    checks.push(() => this.blockchainHealth.isHealthy('blockchain'))
    checks.push(() => this.blockchainHealth.checkSmartContractHealth('smart_contracts'))
    checks.push(() => this.blockchainHealth.checkGasPrice('gas_price'))

    checks.push(() => this.memoryHealth.isHealthy('system_memory'))
    checks.push(() => this.memoryHealth.checkHeapMemory('heap_memory'))
    checks.push(() => this.memoryHealth.checkMemoryLeak('memory_leak'))

    checks.push(() => this.diskHealth.isHealthy('disk_usage'))
    checks.push(() => this.diskHealth.checkUploadsDirectory('uploads_directory'))
    checks.push(() => this.diskHealth.checkLogsDirectory('logs_directory'))

    return this.health.check(checks)
  }

  @Get('status')
  @ApiOperation({ summary: 'Get application status without health checks' })
  async getStatus() {
    return this.healthService.getHealthStatus()
  }

  @Get('system')
  @ApiOperation({ summary: 'Get detailed system information' })
  async getSystemInfo() {
    return this.healthService.getDetailedHealth()
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  async readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redisHealth.isHealthy('redis'),
    ])
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  async liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }
}
