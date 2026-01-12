// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = 'en'; // depois você troca pra ler do segmento/cookie etc.

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
