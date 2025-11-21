# HeroComputer CRM API Documentation

## Общая информация

- **Base URL:** `/api/v1`

- **Формат данных:** JSON

- **Ошибки:**

  - 400 — неверные данные
  - 401 — неавторизованный
  - 403 — доступ запрещен
  - 404 — ресурс не найден
  - 409 — конфликт данных

- **Пользовательские роли в системе:**

  - **ADMIN** — полный контроль: пользователи, доски, задачи, финансы, статистика.
  - **MANAGER** — видит свои доски и задачи, создает задачи, назначает исполнителей, управляет клиентами (добавляет клиентов в доску). Доска может быть без клиента, но должен быть указан email, на который клиент потом зарегистрируется; если клиент есть, бэкенд автоматически добавит его. Может повышать роль CLIENT → EXECUTOR.
  - **CLIENT** — видит только свои доски и задачи, свои данные.
  - **EXECUTOR** — видит только назначенные задачи и доски этих задач (даже если на доске много исполнителей, пока логика видит только свои задачи).

- **Примечания:**

  - Некоторые маршруты **не требуют** заголовка `Authorization`.
  - `tokenExpiresIn` указывается в миллисекундах (15 минут).
  - При успешной авторизации создается `refreshToken`, который хранится в HttpOnly cookie на 7 дней.
  - Каждый раз при обновлении `accessToken` `refreshToken` также обновляется (**rolling refresh token**).

---

## Безопасность критичных операций

Для действий, изменяющих аккаунт пользователя (удаление, смена пароля, изменение email) применяется дополнительная проверка:

- **Наличие refreshToken:** проверка HttpOnly cookie `tokenRefresh`.
- **Валидность refreshToken:** проверка подписи и срока действия.
- **Сравнение токенов:** `sub` из `refreshToken` сравнивается с `sub` из `accessToken`. Несовпадение → `401 Unauthorized`.

**Преимущества:**

- Критичные операции недоступны при краже `accessToken`.
- Снижается риск несанкционированного изменения данных.
- Механизм называется **согласованность токенов** (token binding / token pairing).

---

# Auth

### POST /auth/login

**Описание:** Вход пользователя по email и паролю
**Authorization:** ❌ не требуется

**Запрос:**

```json
{
  "email": "",
  "password": ""
}
```

**Ответ 200 (успех):**

```json
{
  "user": {
    "id": "string",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "name-img | null",,
    "role": "CLIENT",
    "isEmailConfirmed": true,
    "isBlocked": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  },
  "tokenAccess": "jwt_access_token_here",
  "tokenExpiresIn": 900000
}
```

---

### POST /auth/register

**Описание:** Регистрация нового пользователя
**Authorization:** ❌ не требуется

- Примечание: при первой регистрации роль **CLIENT**

**Запрос:**

```json
{
  "name": "",
  "email": "",
  "password": ""
}
```

**Ответ 200 (успех):**

```json
{
  "user": {
    "id": "string",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "name-img | null",
    "role": "CLIENT",
    "isEmailConfirmed": false,
    "isBlocked": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  },
  "tokenAccess": "jwt_access_token_here",
  "tokenExpiresIn": 900000
}
```

---

### **GET /auth/activate**

**Описание:**
Активация пользователя по токену из письма.
После обработки запроса сервер выполняет **редирект** на страницу успешной активации или на страницу ошибки.

**Authorization:** ❌ не требуется

**Запрос:**

```http
GET /auth/activate?token=ACTIVATION_TOKEN
```

**Ответ:**

Эндпоинт **не возвращает JSON**, а выполняет:

- ▶️ **Redirect 302** — на страницу успешной активации (`activationRedirectURL`)
- ❌ **Redirect 302** — на страницу ошибки (`activationErrorRedirectURL`)

---

### POST /auth/refresh-token

**Описание:** Обновление accessToken по refreshToken
**Authorization:** ❌ не требуется (берется из HttpOnly cookie)

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "tokenAccess": "jwt_access_token_here",
  "tokenExpiresIn": 900000
}
```

---

### POST /auth/logout

**Описание:** Выход пользователя из системы. Эндпоинт удаляет refreshToken из базы и из HttpOnly cookie.
Во всех случаях возвращается успешный ответ для безопасности (чтобы не раскрывать существование токена).

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "message": "Успешный выход из системы"
}
```

**Ошибки:** - нет (всегда успешный ответ)

---

# Users

### GET /users

**Описание:** Список пользователей.

**Authorization:** ✅ требуется

- **ADMIN** — видит всех пользователей с дополнительными счетчиками (`tasksAssignedCount`, `boardsAsManagerCount`, `boardsAsClientCount`,
  `commentsCount`, `notificationsCount`).

- **MANAGER** — видит пользователей с ролями CLIENT и EXECUTOR с дополнительными счетчиками.

- **EXECUTOR / CLIENT** — видят только себя, без счетчиков.

**Запрос:** нет тела

**Ответ 200 (успех):**

**Пример для ADMIN / MANAGER:**

```json
{
  "users": [
    {
      "id": "string",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "name-img | null",,
      "role": "CLIENT",
      "isEmailConfirmed": true,
      "isBlocked": false,
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z",
      "tasksAssignedCount": 0,
      "boardsAsManagerCount": 0,
      "boardsAsClientCount": 0,
      "commentsCount": 0,
      "notificationsCount": 0
    },
    {
      "id": "string",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "name-img | null",,
      "role": "CLIENT",
      "isEmailConfirmed": true,
      "isBlocked": false,
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z",
      "tasksAssignedCount": 0,
      "boardsAsManagerCount": 0,
      "boardsAsClientCount": 0,
      "commentsCount": 0,
      "notificationsCount": 0
    }
  ]
}
```

**Пример для EXECUTOR / CLIENT:**: вернет себя

```json
{
  "users": [
    {
      "id": "string",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "name-img | null",,
      "role": "EXECUTOR",
      "isEmailConfirmed": true,
      "isBlocked": false,
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z"
    }
  ]
}
```

---

### GET /users/find-client

**Описание:** Поиск клиентов
**Authorization:** ✅ требуется (ADMIN/MANAGER)

**Запрос:**

```json
{
  "email": "",
  "name": "",
  "isBlocked": false
}
```

**Ответ 200 (успех):**

```json
{
  "users": [
    {
      "id": "string",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "name-img | null",,
      "role": "CLIENT",
      "isEmailConfirmed": true,
      "isBlocked": false,
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z"
    }
  ]
}
```

---

### GET /users/[id]

**Описание:** Детали пользователя

**Authorization:** ✅ требуется

- ADMIN — может видеть любого пользователя.

- MANAGER — может видеть только клиентов и исполнителей.

- CLIENT и EXECUTOR — не могут видеть чужих пользователей, только себя.

**Запрос:** нет тела

**Ответ 200 (успех):**

```json

"user":
    {
      "id": "string",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "name-img | null",,
      "role": "CLIENT",
      "isEmailConfirmed": true,
      "isBlocked": false,
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z",
      "tasksAssignedCount": 0,
      "boardsAsManagerCount": 0,
      "boardsAsClientCount": 0,
      "commentsCount": 0,
      "notificationsCount": 0
    }

```

---

### GET /users/[id]/boards

**Описание:**

Получение всех досок пользователя по его id.

- Для ADMIN — можно получить доски любого пользователя.
- Для других ролей доступ запрещен (в этом маршруте реализован только доступ для ADMIN).

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "user": {
    "id": "string",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "name-img | null",
    "role": "CLIENT",
    "isEmailConfirmed": true,
    "isBlocked": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  },
  "boards": [
    {
      "id": "string",
      "name": "Project Board",
      "clientEmail": "client@example.com",
      "clientId": "string | null",
      "managerId": "string | null",
      "isArchived": false,
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z"
    }
  ]
}
```

---

### GET /users/[id]/tasks

**Описание:** Задачи пользователя

- ADMIN Все задачи любой доски Фильтры работают как есть

- MANAGER Только задачи досок, где он менеджер Может фильтровать, но видит все задачи своей доски

- CLIENT Только задачи своих досок Фильтры применяются внутри своей доски

- EXECUTOR Только задачи, назначенные на него Не видит задачи других исполнителей даже на той же доске

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "tasks": [
    {
      "id": "string",
      "title": "Task title",
      "description": "Optional description",
      "status": "NEW",
      "order": 1,
      "boardId": "string",
      "assignedToId": "string",
      "responsibleId": "string",
      "deadline": "2025-11-21T12:00:00.000Z",
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z"
    }
  ]
}
```

---

### PATCH /users/[id]/change-role

**Описание:** Изменение роли пользователя

- ADMIN может менять любую роль любого пользователя.

- MANAGER может менять только клиентов, повышая их до исполнителей.

- Остальные роли не имеют права менять роли пользователей.

**Authorization:** ✅ требуется (ADMIN/MANAGER)

**Запрос:**

```json
{
  "role": "EXECUTOR"
}
```

**Ответ 200 (успех):**

```json
{
  "user": {
    "id": "string",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "name-img | null",
    "role": "EXECUTOR",
    "isEmailConfirmed": true,
    "isBlocked": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  },
  "message": "Роль пользователя User Name успешно изменена на EXECUTOR"
}
```

---

### PATCH /users/[id]/block

**Описание:** Блокировка пользователя. После успешной блокировки пользователь остаётся в системе, но не сможет выполнять действия, требующие авторизации.Только для **ADMIN**

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "user": {
    "id": "string",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "name-img | null",
    "role": "EXECUTOR",
    "isEmailConfirmed": true,
    "isBlocked": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  },
  "message": "Пользователь ${blockedUser.name} заблокирован"
}
```

---

### PATCH /users/[id]/unblock

**Описание:** Разблокировка пользователя. Только для **ADMIN**

**Authorization:** ✅

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "message": "Пользователь ${blockedUser.name} разблокирован"
}
```

**Ошибки:** 400, 404

---

### DELETE /users/[id]

**Описание:** Удаление пользователя, только для **ADMIN**

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "message": "Пользователь с ID ${deleteUserId} успешно удалён"
}
```

---

# Me

### GET /me/get

**Описание:** Информация о текущем пользователе

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "user": {
    "id": "string",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "name-img | null",
    "role": "EXECUTOR",
    "isEmailConfirmed": true,
    "isBlocked": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  }
}
```

---

### PATCH /me/profile

**Описание:** Обновление профиля

**Authorization:** ✅ требуется

**Запрос:**

```json
{
  "name": "New Name", // необязательно
  "avatar": "name-img", // необязательно
  "email": "new@example.com" // необязательно
}
```

**Ответ 200 (успех):**

```json
{
  "message": "Профиль обновлен",
  "user": {
    "id": "string",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "name-img | null",
    "role": "EXECUTOR",
    "isEmailConfirmed": true,
    "isBlocked": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  }
}
```

---

### PATCH /me/password

**Описание:** Смена пароля

**Authorization:** ✅ требуется

**Запрос:**

```json
{
  "oldPassword": "",
  "newPassword": ""
}
```

**Ответ 200 (успех):**

```json
{
  "message": "Пароль изменен"
}
```

**Ошибки:** 401, 403, 404

---

### DELETE /me/delete

**Описание:** Удаление аккаунта

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "message": "Пользователь с ID ${e.context.currentUserPayload.sub} успешно удалён"
}
```

---

# Boards

### GET /boards

**Описание:** Получить список досок

- ADMIN все доски.

- MANAGER только свои доски.

- Остальные роли только свои доски.

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "boards": [
    {
      "id": "string",
      "name": "string",
      "clientEmail": "string",
      "clientId": "string | null",
      "managerId": "string | null",
      "isArchived": false,
      "createdAt": "2025-11-21T12:00:00.000Z",
      "updatedAt": "2025-11-21T12:00:00.000Z"
    }
  ]
}
```

---

### POST /boards/create

**Описание:** Создание доски

- Только **ADMIN** и **MANAGER**

**Authorization:** ✅ требуется

**Запрос:**

```json
{
  "name": "name-board",
  "clientEmail": "client@yandex.ru",
  "managerId": "string | null" // может быть null, если доску создает сам менеджер, то не передаем, бекенд сам запишет.Только админ может выбирать менеджера на доску
}
```

**Ответ 200 (успех):**

```json
{
  "board": {
    "id": "string",
    "name": "string",
    "clientEmail": "string",
    "clientId": "string | null",
    "managerId": "string", // при создание менеджер есть всегда, или админ кого выбрал или бекенд запишет менеджера создавшего доску
    "isArchived": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  }
}
```

---

### GET /boards/[id]

**Описание:** Получить конкретную доску

- ADMIN все доски.

- MANAGER только свои доски.

- Остальные роли только свои доски.

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "board": {
    "id": "string",
    "name": "string",
    "clientEmail": "string",
    "clientId": "string | null",
    "managerId": "string | null",
    "isArchived": false,
    "createdAt": "2025-11-21T12:00:00.000Z",
    "updatedAt": "2025-11-21T12:00:00.000Z"
  }
}
```

---

### PATCH /boards/[id]/update

**Описание:** Обновление доски

- ADMIN все.

- MANAGER только свои доски, не может менять менеджера.

**Authorization:** ✅ требуется

**Запрос:** можно передать частично любое из полей

```json
{
  "name": "name",
  "clientEmail": "client@yandex.ru",
  "clientId": "string",
  "managerId": "string",
  "isArchived": true
}
```

**Ответ 200 (успех):**

```json
{
 "board": {
 {
  "id": "string",
  "name": "string",
  "clientEmail": "string",
  "clientId": "string | null",
  "managerId": "string | null",
  "isArchived": false,
  "createdAt": "2025-11-21T12:00:00.000Z",
  "updatedAt": "2025-11-21T12:00:00.000Z"
  }
   },
   "message": "Доска обновлена"
}
```

---

### GET /boards/[id]/tasks

**Описание:** Получение задач доски

- **ADMIN** все доски, остальные только свои

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "status": "TypeProjectStatus",
      "order": "number | null",
      "boardId": "string",
      "assignedToId": "string | null",
      "responsibleId": "string | null",
      "deadline": "2025-01-01T00:00:00.000Z | null",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

# Tasks

### GET /tasks

**Описание:** Список всех задач

- ADMIN все задачи.

- MANAGER только свои задачи своих досок.

- CLIENT только свои задачи своих досок.

- EXECUTOR только назначенные задачи

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "status": "TypeProjectStatus",
      "order": "number | null",
      "boardId": "string",
      "assignedToId": "string | null",
      "responsibleId": "string | null",
      "deadline": "2025-01-01T00:00:00.000Z | null",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /tasks/create

**Описание:** Создание задачи

- ADMIN/MANAGER

**Authorization:** ✅ требуется

**Запрос:**

```json
{
  "title": "string",
  "boardId": "string",
  "deadline": "2025-01-01T00:00:00.000Z | null",
  "description": "string | null",
  "status": "NEW",
  "assignedToId": "string | null",
  "responsibleId": "string", // админ может выбирать из менеджеров на задачу(responsibleId), а менеджер назначается автоматом
  "order": "number | null"
}
```

**Ответ 200 (успех):**

```json
{
  "task": {
    "id": "string",
    "title": "string",
    "description": "string | null",
    "status": "TypeProjectStatus",
    "order": "number | null",
    "boardId": "string",
    "assignedToId": "string | null",
    "responsibleId": "string",
    "deadline": "2025-01-01T00:00:00.000Z | null",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### GET /tasks/[id]

**Описание:** Получить конкретную задачу

- ADMIN все задачи.

- MANAGER только свои задачи своих досок.

- CLIENT только свои задачи своих досок.

- EXECUTOR только назначенные задачи

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "task": {
    "id": "string",
    "title": "string",
    "description": "string | null",
    "status": "TypeProjectStatus",
    "order": "number | null",
    "boardId": "string",
    "assignedToId": "string | null",
    "responsibleId": "string | null",
    "deadline": "2025-01-01T00:00:00.000Z | null",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH /tasks/[id]/update

**Описание:** Обновление задачи

- ADMIN все задачи.

- MANAGER только свои задачи своих досок.

- EXECUTOR только order и status

**Authorization:** ✅ требуется

**Запрос:** можно передать частично любое из полей

```json
{
  "title": "name",
  "description": "description",
  "status": "TypeProjectStatus",
  "assignedToId": "string | null",
  "responsibleId": "string | null", // меняет только админ
  "order": 2,
  "deadline": "2025-01-01T00:00:00.000Z"
}
```

**Ответ 200 (успех):**

```json
{
  "task": {
    "id": "string",
    "title": "string",
    "description": "string | null",
    "status": "TypeProjectStatus",
    "order": "number | null",
    "boardId": "string",
    "assignedToId": "string | null",
    "responsibleId": "string | null",
    "deadline": "2025-01-01T00:00:00.000Z | null",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Задача обновлена"
}
```

---

### GET /tasks/[id]/comments

**Описание:** Получение комментариев задачи

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "comments": [
    {
      "id": "string",
      "text": "string",
      "authorId": "string",
      "boardId": "string",
      "taskId": "string | null | undefined",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

# Comments

### POST /comments/create

**Описание:** Создание комментария

**Authorization:** ✅ требуется

**Запрос:**

```json
{
  "text": "string",
  "authorId": "string",
  "boardId": "string",
  "taskId": "string | null | undefined"
}
```

**Ответ 200 (успех):**

```json
{
  "id": "string",
  "text": "string",
  "authorId": "string",
  "boardId": "string",
  "taskId": "string | null | undefined",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### PATCH /comments/[id]/update

**Описание:** Обновление комментария

**Authorization:** ✅ требуется

**Запрос:**

```json
{
  "text": "string"
}
```

**Ответ 200 (успех):**

```json
{
  "comment": {
    "id": "string",
    "text": "string",
    "authorId": "string",
    "boardId": "string",
    "taskId": "string | null | undefined",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Коммент обновлен"
}
```

---

### DELETE /comments/[id]/delete

**Описание:** Удаление комментария
**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "comment": {
    "id": "string",
    "text": "string",
    "authorId": "string",
    "boardId": "string",
    "taskId": "string | null | undefined",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Коммент удален"
}
```

---

# Notifications

### GET /notifications

**Описание:** Список уведомлений текущего пользователя

**Authorization:** ✅ требуется

**Запрос:** нет тела

**Ответ 200 (успех):**

```json
{
  "notifications": [
    {
      "id": "string",
      "userId": "string",
      "boardId": "string | null | undefined",
      "taskId": "string | null | undefined",
      "type": "NotificationType",
      "message": "string",
      "meta": "any | null",
      "isRead": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH /notifications/mark-read

**Описание:** Пометить уведомления как прочитанные

**Authorization:** ✅ требуется


**Запрос:** нет тела, сразу все как прочитанные 

**Ответ 200 (успех):**

```json
{
   "updated": 4,
}
```
