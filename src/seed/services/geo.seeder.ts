import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

export default async function () {
  return new Promise(async (res, reject) => {
    try {
      const japanese = await this.getLanguagesByCode('ja-JP')
      const kana = await this.getLanguagesByCode('ja-Kana')
      const spanish = await this.getLanguagesByCode('es-ES')
      const chinese = await this.getLanguagesByCode('zh-CN')
      const german = await this.getLanguagesByCode('de-DE')
      const hindi = await this.getLanguagesByCode('hi-IN')
      const french = await this.getLanguagesByCode('fr-FR')
      const italian = await this.getLanguagesByCode('it-IT')

      const africa = await this.entityManager.findOne('continents', {
        where: {
          name: 'Africa',
        },
      })

      const northAmerica = await this.entityManager.findOne('continents', {
        where: {
          name: 'North America',
        },
      })

      const antarctica = await this.entityManager.findOne('continents', {
        where: {
          name: 'Antarctica',
        },
      })

      const asia = await this.entityManager.findOne('continents', {
        where: {
          name: 'Asia',
        },
      })

      const europe = await this.entityManager.findOne('continents', {
        where: {
          name: 'Europe',
        },
      })

      const oceania = await this.entityManager.findOne('continents', {
        where: {
          name: 'Oceania',
        },
      })

      const southAmerica = await this.entityManager.findOne('continents', {
        where: {
          name: 'South America',
        },
      })

      await this.entityManager.delete('country_translations', {})
      await this.entityManager.delete('province_translations', {})
      await this.entityManager.delete('continent_translations', {})

      await this.entityManager.save('continents', [
        {
          ...africa,
          name: 'Africa',
          code: 'AF',
          translations: [
            {
              language: japanese,
              name: 'アフリカ',
            },
            {
              language: kana,
              name: 'アフリカ',
            },
            {
              language: spanish,
              name: 'África',
            },
            {
              language: chinese,
              name: '非洲',
            },
            {
              language: german,
              name: 'Afrika',
            },
            {
              language: hindi,
              name: 'अफ्रीका',
            },
            {
              language: french,
              name: 'Afrique',
            },
            {
              language: italian,
              name: 'Africa',
            },
          ],
        },
        {
          ...antarctica,
          name: 'Antarctica',
          code: 'AN',
          translations: [
            {
              language: japanese,
              name: '南極大陸',
            },
            {
              language: kana,
              name: '南極大陸',
            },
            {
              language: spanish,
              name: 'Antártida',
            },
            {
              language: chinese,
              name: '南极洲',
            },
            {
              language: german,
              name: 'Antarktis',
            },
            {
              language: hindi,
              name: 'अंटार्कटिका',
            },
            {
              language: french,
              name: 'Antarctique',
            },
            {
              language: italian,
              name: 'Antartide',
            },
          ],
        },
        {
          ...asia,
          name: 'Asia',
          code: 'AS',
          translations: [
            {
              language: japanese,
              name: 'アジア',
            },
            {
              language: kana,
              name: 'アジア',
            },
            {
              language: spanish,
              name: 'Asia',
            },
            {
              language: chinese,
              name: '亚洲',
            },
            {
              language: german,
              name: 'Asien',
            },
            {
              language: hindi,
              name: 'एशिया',
            },
            {
              language: french,
              name: 'Asie',
            },
            {
              language: italian,
              name: 'Asia',
            },
          ],
        },
        {
          ...europe,
          name: 'Europe',
          code: 'EU',
          translation: [
            {
              language: japanese,
              name: 'ヨーロッパ',
            },
            {
              language: kana,
              name: 'ヨーロッパ',
            },
            {
              language: spanish,
              name: 'Europa',
            },
            {
              language: chinese,
              name: '欧洲',
            },
            {
              language: german,
              name: 'Europa',
            },
            {
              language: hindi,
              name: 'यूरोप',
            },
            {
              language: french,
              name: `L'Europe`,
            },
            {
              language: italian,
              name: 'Europa',
            },
          ],
        },
        {
          ...northAmerica,
          name: 'North America',
          code: 'NA',
          translations: [
            {
              language: japanese,
              name: '北アメリカ',
            },
            {
              language: kana,
              name: '北アメリカ',
            },
            {
              language: spanish,
              name: 'América del Norte',
            },
            {
              language: chinese,
              name: '北美洲',
            },
            {
              language: german,
              name: 'Nordamerika',
            },
            {
              language: hindi,
              name: 'उत्तरी अमेरिका',
            },
            {
              language: french,
              name: 'Amérique du Nord',
            },
            {
              language: italian,
              name: 'America del Nord',
            },
          ],
        },
        {
          ...oceania,
          name: 'Oceania',
          code: 'OC',
          translations: [
            {
              language: japanese,
              name: 'オセアニア',
            },
            {
              language: kana,
              name: 'オセアニア',
            },
            {
              language: spanish,
              name: 'Oceanía',
            },
            {
              language: chinese,
              name: '大洋洲',
            },
            {
              language: german,
              name: 'Ozeanien',
            },
            {
              language: hindi,
              name: 'ओशियानिया',
            },
            {
              language: french,
              name: 'Océanie',
            },
            {
              language: italian,
              name: 'Oceania',
            },
          ],
        },
        {
          ...southAmerica,
          name: 'South America',
          code: 'SA',
          translations: [
            {
              language: japanese,
              name: '南アメリカ',
            },
            {
              language: kana,
              name: '南アメリカ',
            },
            {
              language: spanish,
              name: 'Sudamerica',
            },
            {
              language: chinese,
              name: '南美洲',
            },
            {
              language: german,
              name: 'Südamerika',
            },
            {
              language: hindi,
              name: 'दक्षिण अमेरिका',
            },
            {
              language: french,
              name: 'Amérique du Sud',
            },
            {
              language: italian,
              name: 'Sud America',
            },
          ],
        },
      ])

      const countries = JSON.parse(
        readFileSync(resolve(process.cwd(), 'src/seed/data/countries.json'), 'utf-8'),
      )

      await Promise.all(
        countries.map(async (country: any) => {
          return new Promise(async (resolve, reject) => {
            try {
              const exists = await this.entityManager.findOne('countries', {
                where: {
                  name: country.name,
                  code: country.code,
                },
              })

              const provinces = []
              const translation = []

              for (const t of country.translations) {
                let language

                switch (t.language) {
                  case 'ja-JP':
                    language = japanese
                    break
                  case 'ja-Kana':
                    language = kana
                    break
                  case 'es-ES':
                    language = spanish
                    break
                  case 'zh-CN':
                    language = chinese
                    break
                  case 'de-DE':
                    language = german
                    break
                  case 'hi-IN':
                    language = hindi
                    break
                  case 'fr-FR':
                    language = french
                    break
                  case 'it-IT':
                    language = italian
                    break
                  default:
                    break
                }

                translation.push({
                  language,
                  name: t.name,
                })
              }

              for (const p of country.province) {
                const new_province = {
                  name: p.name,
                  translations: [],
                }

                const existingProvince = await this.entityManager.findOne('provinces', {
                  where: {
                    name: p.name,
                  },
                })

                if (p) {
                  for (const t of p.translations) {
                    let language

                    switch (t.language) {
                      case 'ja-JP':
                        language = japanese
                        break
                      case 'ja-Kana':
                        language = kana
                        break
                      case 'es-ES':
                        language = spanish
                        break
                      case 'zh-CN':
                        language = chinese
                        break
                      case 'de-DE':
                        language = german
                        break
                      case 'hi-IN':
                        language = hindi
                        break
                      case 'fr-FR':
                        language = french
                        break
                      case 'it-IT':
                        language = italian
                        break
                      default:
                        break
                    }

                    new_province.translations.push({
                      language,
                      name: t.name,
                    })
                  }
                }

                provinces.push({
                  ...new_province,
                  ...existingProvince,
                })
              }

              await this.entityManager.save('countries', {
                ...exists,
                name: country.name,
                code: country.code,
                continent: await this.entityManager.findOne('continents', {
                  where: {
                    name: country.continent,
                  },
                }),
                translations: translation,
                provinces,
              })

              resolve('success')
            } catch (error) {
              reject(error)
            }
          })
        }),
      )

      res('success')
    } catch (error) {
      reject(error)
    }
  })
}
