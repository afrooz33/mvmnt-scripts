import * as bcrypt from 'bcryptjs'

export default async function (attempt: string): Promise<boolean> {
  return await bcrypt.compare(attempt, this.password)
}
