import * as fs from 'node:fs'
import * as path from 'node:path'
import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult } from '@nestjs/terminus'

@Injectable()
export class DiskHealthIndicator {
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
      const diskUsage = await this.getDiskUsage('/')
      const usagePercent = (diskUsage.used / diskUsage.total) * 100

      // Check if disk usage is within acceptable limits (90% threshold)
      if (usagePercent > 90) {
        return this.getStatus(key, false, {
          message: `Disk usage too high: ${usagePercent.toFixed(2)}%`,
          total: this.formatBytes(diskUsage.total),
          used: this.formatBytes(diskUsage.used),
          free: this.formatBytes(diskUsage.free),
          usagePercent: `${usagePercent.toFixed(2)}%`,
        })
      }

      return this.getStatus(key, true, {
        message: 'Disk usage is healthy',
        total: this.formatBytes(diskUsage.total),
        used: this.formatBytes(diskUsage.used),
        free: this.formatBytes(diskUsage.free),
        usagePercent: `${usagePercent.toFixed(2)}%`,
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }

  async checkUploadsDirectory(key: string): Promise<HealthIndicatorResult> {
    try {
      const uploadsPath = path.join(process.cwd(), 'uploads')

      // Check if uploads directory exists
      if (!fs.existsSync(uploadsPath)) {
        return this.getStatus(key, false, {
          message: 'Uploads directory does not exist',
        })
      }

      // Check directory permissions
      try {
        fs.accessSync(uploadsPath, fs.constants.R_OK | fs.constants.W_OK)
      } catch (error) {
        return this.getStatus(key, false, {
          message: 'Uploads directory permissions issue',
        })
      }

      // Get directory size
      const dirSize = await this.getDirectorySize(uploadsPath)
      const maxSize = 10 * 1024 * 1024 * 1024 // 10GB limit

      if (dirSize > maxSize) {
        return this.getStatus(key, false, {
          message: `Uploads directory too large: ${this.formatBytes(dirSize)}`,
          size: this.formatBytes(dirSize),
          maxSize: this.formatBytes(maxSize),
        })
      }

      return this.getStatus(key, true, {
        message: 'Uploads directory is healthy',
        path: uploadsPath,
        size: this.formatBytes(dirSize),
        maxSize: this.formatBytes(maxSize),
        permissions: 'read-write',
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }

  async checkLogsDirectory(key: string): Promise<HealthIndicatorResult> {
    try {
      const logsPath = path.join(process.cwd(), 'logs')

      // Check if logs directory exists
      if (!fs.existsSync(logsPath)) {
        // Create logs directory if it doesn't exist
        fs.mkdirSync(logsPath, { recursive: true })
      }

      // Check directory permissions
      try {
        fs.accessSync(logsPath, fs.constants.R_OK | fs.constants.W_OK)
      } catch (error) {
        return this.getStatus(key, false, {
          message: 'Logs directory permissions issue',
        })
      }

      // Get directory size
      const dirSize = await this.getDirectorySize(logsPath)
      const maxSize = 1 * 1024 * 1024 * 1024 // 1GB limit

      if (dirSize > maxSize) {
        return this.getStatus(key, false, {
          message: `Logs directory too large: ${this.formatBytes(dirSize)}`,
          size: this.formatBytes(dirSize),
          maxSize: this.formatBytes(maxSize),
        })
      }

      return this.getStatus(key, true, {
        message: 'Logs directory is healthy',
        path: logsPath,
        size: this.formatBytes(dirSize),
        maxSize: this.formatBytes(maxSize),
        permissions: 'read-write',
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }

  private async getDiskUsage(path: string): Promise<{ total: number; used: number; free: number }> {
    return new Promise((resolve, reject) => {
      fs.statfs(path, (err, stats) => {
        if (err) {
          reject(err)
          return
        }

        const total = stats.blocks * stats.bsize
        const free = stats.bavail * stats.bsize
        const used = total - free

        resolve({ total, used, free })
      })
    })
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let totalSize = 0

      const calculateSize = (currentPath: string) => {
        try {
          const stats = fs.statSync(currentPath)

          if (stats.isFile()) {
            totalSize += stats.size
          } else if (stats.isDirectory()) {
            const files = fs.readdirSync(currentPath)
            files.forEach((file) => {
              calculateSize(path.join(currentPath, file))
            })
          }
        } catch (error) {
          // Skip files/directories that can't be accessed
        }
      }

      try {
        calculateSize(dirPath)
        resolve(totalSize)
      } catch (error) {
        reject(error)
      }
    })
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
