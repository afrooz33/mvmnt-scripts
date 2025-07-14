/**
 * Returns the response object for the user invitation entity
 * @returns {Record<string, any>} The response object
 */
export default function (): any {
  const responseObject: any = {
    id: this.id,
    created: this.created,
  }

  return responseObject
}
