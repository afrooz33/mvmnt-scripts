export interface ContentResponseObject {
  id: string
  user: {
    id: string
    username: string
    display_name: string
  }
  brand: {
    id: string
    name: string
    translations: Array<any>
  }
  deal: {
    id: string
    title: string
  }
  category: {
    id: string
    name: string
    translations: Array<any>
  }
}
