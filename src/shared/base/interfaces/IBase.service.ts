export interface IBaseService<T, R> {
  documentExists(data, T): Promise<T>
  paginate(data): Promise<R>
  updateOne(payload, options?): Promise<T>
}
