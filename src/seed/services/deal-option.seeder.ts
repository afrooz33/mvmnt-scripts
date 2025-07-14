export default async function () {
  return new Promise(async (resolve, reject) => {
    try {
      await this.entityManager.upsert(
        'deal_options',
        [
          {
            type: 'color',
          },
          {
            type: 'size',
          },
          {
            type: 'weight',
          },
          {
            type: 'material',
          },
        ],
        ['type'],
      )

      resolve('success')
    } catch (error) {
      reject(error)
    }
  })
}
