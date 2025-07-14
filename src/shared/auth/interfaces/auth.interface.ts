export default interface IAuth {
  id: string
  username?: string
  email: string
  display_name?: string
  reset_password_token?: string
  comparePassword(password: string): any
  hashPassword(password: string): any
  toResponseObject(): any
}
