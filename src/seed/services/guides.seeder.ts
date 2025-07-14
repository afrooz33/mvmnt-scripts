import { faker } from '@faker-js/faker'
import { GuideLevel } from '@app/src/admin/guides/enums'
import { GuideStatus } from '@app/src/admin/guides/enums'

export default async function () {
  const languages = {
    japanese: await this.getLanguagesByCode('ja-JP'),
    kana: await this.getLanguagesByCode('ja-Kana'),
    spanish: await this.getLanguagesByCode('es-ES'),
    chinese: await this.getLanguagesByCode('zh-CN'),
    german: await this.getLanguagesByCode('de-DE'),
    hindi: await this.getLanguagesByCode('hi-IN'),
    french: await this.getLanguagesByCode('fr-FR'),
    italian: await this.getLanguagesByCode('it-IT'),
  }

  //truncate guides table
  await this.entityManager.transaction(async (transactionalEntityManager) => {
    await transactionalEntityManager.query('DELETE FROM guide_translations')
    await transactionalEntityManager.query('DELETE FROM guides')
  })

  const bigGuide = [
    { key: 'forBeginners', title: 'For beginners' },
    { key: 'searchFaq', title: 'Search from FAQ' },
    { key: 'searchCategory', title: 'Search from category' },
    { key: 'currentBalance', title: 'Current balance' },
    { key: 'balanceHistory', title: 'Balance history' },
    { key: 'salesHistory', title: 'Sales history' },
  ]

  const translations = {
    japanese: [
      '初心者向け',
      'FAQから検索',
      'カテゴリーから検索',
      '現在の残高',
      '残高履歴',
      '売上履歴',
    ],
    kana: [
      'ショシンシャムケ',
      'FAQカラケンサク',
      'カテゴリーカラケンサク',
      'ゲンザイノザンダカ',
      'ザンダカリレキ',
      'ウリアゲリレキ',
    ],
    spanish: [
      'Para principiantes',
      'Buscar en las preguntas frecuentes',
      'Buscar por categoría',
      'Saldo actual',
      'Historial de saldos',
      'Historial de ventas',
    ],
    chinese: ['初学者指南', '从常见问题搜索', '从类别搜索', '当前余额', '余额历史', '销售历史'],
    german: [
      'Für Anfänger',
      'In den FAQs suchen',
      'Nach Kategorien suchen',
      'Aktueller Kontostand',
      'Kontoverlauf',
      'Verkaufsverlauf',
    ],
    hindi: [
      'शुरुआती गाइड',
      'सामान्य प्रश्नों से खोजें',
      'श्रेणी से खोजें',
      'वर्तमान शेष राशि',
      'शेष राशि इतिहास',
      'बिक्री इतिहास',
    ],
    french: [
      'Pour les débutants',
      'Rechercher dans la FAQ',
      'Rechercher par catégorie',
      'Solde actuel',
      'Historique des soldes',
      'Historique des ventes',
    ],
    italian: [
      'Per i principianti',
      'Cerca nelle FAQ',
      'Cerca per categoria',
      'Saldo attuale',
      'Storico dei saldi',
      'Storico delle vendite',
    ],
  }

  await Promise.all(
    bigGuide.map(async (guide, index) => {
      const big = await this.entityManager.save('guides', {
        name: guide.title,
        level: GuideLevel.BIG,
        status: GuideStatus.ENABLED,
        display_order: index + 1,
        translations: Object.entries(languages)
          .map(([key, language]) => {
            if (!translations[key] || !translations[key][index]) {
              console.warn(`Missing translation for key: ${key}, index: ${index}`)
              return null
            }
            return {
              language: language.id,
              name: translations[key][index],
            }
          })
          .filter(Boolean),
      })

      const middleGuides = Array.from({ length: 5 }, (_, i) => ({
        name: `${guide.title} - Middle Guide ${i + 1}`,
        level: GuideLevel.MIDDLE,
        status: GuideStatus.ENABLED,
        parent: big,
        display_order: index + i + 1,
        translations: Object.entries(languages)
          .map(([key, language]) => {
            if (!translations[key] || !translations[key][index]) {
              console.warn(`Missing translation for key: ${key}, index: ${index}`)
              return null
            }
            return {
              language: language.id,
              name: `${translations[key][index]} - 中間ガイド ${i + 1}`,
            }
          })
          .filter(Boolean),
      }))

      await Promise.all(
        middleGuides.map(async (middleGuide) => {
          const middle = await this.entityManager.save('guides', middleGuide)

          const articleCount = Math.floor(Math.random() * 6) + 5 // 5-10 articles
          const articles = Array.from({ length: articleCount }, (_, j) => ({
            name: `${middleGuide.name} - Article ${j + 1}`,
            level: GuideLevel.ARTICLE,
            status: GuideStatus.ENABLED,
            parent: middle,
            display_order: index + j + 1,
            description: faker.lorem.paragraph(),
            translations: middleGuide.translations.map((t) => ({
              language: t.language,
              name: `${t.name} - 記事 ${j + 1}`,
            })),
          }))

          await Promise.all(
            articles.map(async (article) => {
              await this.entityManager.save('guides', article)
            }),
          )
        }),
      )
    }),
  )
}
