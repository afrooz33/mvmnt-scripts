/**
 * Returns the response object
 * @returns {Record<string, any>} The response object
 */
export default function (): any {
  const responseObject: any = {
    id: this.id,
    comment: this.comment,
    created: this.created,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.mentioned_users) {
    responseObject.mentioned_users = this.mentioned_users
  }

  return responseObject
}
