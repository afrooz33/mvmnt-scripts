export interface ICacheManager {
  get(key: string): Promise<any>
  set(key: string, value: any, options?: { ttl?: number }): Promise<void>
  del(key: string): Promise<void>
  reset(): Promise<void>
}
