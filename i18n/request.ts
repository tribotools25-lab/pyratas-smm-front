import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async ({locale}) => {
  // Se seu projeto usa /messages, beleza.
  // Se usa /src/messages, ajuste o path.
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {messages};
});
