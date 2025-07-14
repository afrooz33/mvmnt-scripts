import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { UploadType } from '@app/src/shared/enums'
import { IdentityDocumentType, VerificationStatus } from '@app/src/users/profile/enums'

export default async function (total = 10) {
  const users: ISeederEntity[] = await this.getUsers()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const user = faker.helpers.arrayElement(users).id
          let status = faker.helpers.enumValue(VerificationStatus)

          const identityDocument = await this.entityManager.findOne('user_identity_documents', {
            where: {
              user: {
                id: user,
              },
              status: VerificationStatus.VERIFIED,
            },
            select: ['id'],
          })

          if (identityDocument) {
            status = VerificationStatus.DECLINED
          }

          await this.entityManager.save('user_identity_documents', {
            name: {
              first_name: faker.person.firstName(),
              last_name: faker.person.lastName(),
              kanji: {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
              },
              kana: {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
              },
            },
            birthday: faker.date.birthdate(),
            user,
            type: faker.helpers.enumValue(IdentityDocumentType),
            front_image: await this.getFakerImage(UploadType.USER_VERIFICATION),
            back_image: await this.getFakerImage(UploadType.USER_VERIFICATION),
            status,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
