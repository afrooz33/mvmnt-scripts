import { createParamDecorator, ExecutionContext, NotAcceptableException } from '@nestjs/common'

export const AcceptLanguage = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const acceptLanguageHeader = request.headers['accept-language'] ?? 'en-US'

  const acceptedLanguages = [
    'en-US',
    'hi-IN',
    'zh-CN',
    'es-ES',
    'fr-FR',
    'ja-JP',
    'it-IT',
    'de-DE',
    'ja-Kana',
  ]

  if (acceptedLanguages.includes(acceptLanguageHeader)) {
    return acceptLanguageHeader
  } else {
    throw new NotAcceptableException('Invalid language code')
  }
})
