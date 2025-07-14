import { UseInterceptors } from '@nestjs/common'
import { CacheInterceptor } from '@nestjs/cache-manager'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  key?: string // Custom cache key
}

/**
 * Decorator that enables caching for a route handler or a service method
 *
 * @param prefix - The prefix to use for the cache key
 * @param options - Cache options including TTL and custom key
 * @returns MethodDecorator
 *
 * @example
 * ```typescript
 * @Cacheable('deals', { ttl: 3600 })
 * async getDeal(id: string) {
 *   // This result will be cached for 1 hour
 *   return await this.dealRepository.findOne(id);
 * }
 * ```
 */
export function Cacheable(prefix: string, options: CacheOptions = {}): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheManager = this.cacheManager // Assumes cache manager is injected
      if (!cacheManager) {
        return await originalMethod.apply(this, args)
      }

      // Generate cache key
      const cacheKey = options.key || `${prefix}:${propertyKey.toString()}:${JSON.stringify(args)}`

      // Try to get from cache first
      const cachedValue = await cacheManager.get(cacheKey)
      if (cachedValue) {
        return cachedValue
      }

      // If not in cache, execute method and cache result
      const result = await originalMethod.apply(this, args)

      if (result) {
        await cacheManager.set(
          cacheKey,
          result,
          { ttl: options.ttl || 3600 }, // Default 1 hour TTL
        )
      }

      return result
    }

    return descriptor
  }
}

/**
 * Combined decorator that applies both Cacheable and UseInterceptors(CacheInterceptor)
 */
export function CacheableRoute(prefix: string, options: CacheOptions = {}) {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    UseInterceptors(CacheInterceptor)(target, propertyKey, descriptor)
    Cacheable(prefix, options)(target, propertyKey, descriptor)
    return descriptor
  }
}
