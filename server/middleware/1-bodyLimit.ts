
// В Nuxt 3 порядок выполнения глобальных middleware определяется именами файлов:
// 1️⃣ Сначала выполняются файлы с числами в начале имени, например: 01-atom.ts, 02-bodyLimit.ts
// 2️⃣ Затем выполняются файлы без числа, по алфавиту: auth.ts, logger.ts и т.д.
// 🔹 Таким образом можно контролировать порядок выполнения middleware.

export default defineEventHandler((event) => {
  const method = event.method;

  // GET и DELETE не имеют body → просто пропускаем
  if (method === "GET" || method === "DELETE") {
    return;
  }
  
  const MAX_SIZE = 50 * 1024; // 50 KB
  const contentLengthHeader = getRequestHeader(event, "content-length");
  const contentLength = Number(contentLengthHeader || 0);

  console.log(contentLength, 'contentLength');
  

  if (!contentLengthHeader) {
    throw createError({
      statusCode: 400,
      statusMessage: "Content-Length header missing"
    });
  }

  if (contentLength > MAX_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: "Payload too large"
    });
  }

});
