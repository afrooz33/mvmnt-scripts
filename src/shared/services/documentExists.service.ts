import { DocumentExistsDataInterface } from '@app/src/shared/interfaces'

export default async function (
  repository: any,
  { condition, errorMessage }: DocumentExistsDataInterface,
): Promise<any> {
  return await repository.target.documentExists(condition, errorMessage)
}
