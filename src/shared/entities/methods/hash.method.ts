import * as bcrypt from 'bcryptjs'

export default async function (): Promise<void> {
  if (this.password) {
    const hash = await bcrypt.genSalt(12)

    this.password = await bcrypt.hash(this.password, hash)
  }
}
