import { join } from 'path'
import { existsSync } from 'fs'

import { AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n'

// Determine the correct path for locales
const getLocalesPath = () => {
  const possiblePaths = [
    join(process.cwd(), 'dist/src/shared/locales/'),
    join(process.cwd(), 'dist/shared/locales/'),
    join(process.cwd(), 'src/shared/locales/'),
    join(__dirname, '../shared/locales/'),
  ]

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      console.log(`[I18nConfig] Using locales path: ${path}`)
      return path
    }
  }

  // If no locales directory exists, create a minimal one
  const fallbackPath = join(process.cwd(), 'src/shared/locales/')
  console.warn(`[I18nConfig] No locales directory found. Using fallback path: ${fallbackPath}`)
  return fallbackPath
}

export default {
  fallbackLanguage: 'en',
  loaderOptions: {
    path: getLocalesPath(),
    watch: true,
  },
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    AcceptLanguageResolver,
  ],
}
