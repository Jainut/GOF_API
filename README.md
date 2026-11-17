# GOF API

REST API for tracking tool checkouts, returns, and inventory in industrial storerooms. It manages users, NFC cards, and tools, receives card reads over MQTT, and sends real-time updates to the React interface via Socket.IO.

## Demo

**[Try the interactive demo (in Portuguese)](https://jainut.github.io/GOF_Interface/)**

Check out or return a tool in the [React interface](https://github.com/Jainut/GOF_Interface), then open **Eventos e API simulada** to inspect the HTTP routes, sample JSON responses, and the NFC event. The demo simulates these interactions in the browser using fictional data.

## Tech stack

- Node.js with Express 5
- PostgreSQL and Prisma ORM
- JWT in HttpOnly cookies
- bcrypt for password hashing
- MQTT (HiveMQ) for NFC card reads
- Socket.IO for real-time events

## Prerequisites

- Node.js 18 or later
- An accessible PostgreSQL database

## Local setup

1. Install the dependencies.

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root.

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   JWT_SECRET="your-strong-secret-key"
   PORT=3000
   # Optional URL for the API's periodic self-ping
   SELF_PING_URL="http://localhost:3000/"
   ```

3. Generate the Prisma client and apply the schema to the database.

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the API.

   ```bash
   node server.js
   ```

The API runs at `http://localhost:3000` by default. Send a `GET /` request to check whether it is running.

## Authentication

The login routes set a JWT in the `token` cookie. Protected routes require this cookie. When calling the API from a web client, include credentials with `credentials: 'include'` in `fetch`.

| Method | Route | Request body |
| --- | --- | --- |
| `POST` | `/login/almoxarife` | `{ "cpf": "...", "senha": "..." }` |
| `POST` | `/login/admin` | `{ "cpf": "...", "senha": "..." }` |
| `POST` | `/login/NFC` | `{ "uid": "..." }` |

## Protected endpoints

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/registrar/Emprestimo` | Records a checkout and its line items. |
| `POST` | `/registrar/Devolucao` | Records the return of a checkout. |
| `GET` | `/listar/Emprestimos` | Lists all checkouts with their users and tools. |
| `GET` | `/listar/Devolucoes` | Lists recorded returns. |
| `GET` | `/listar/Ferramentas` | Lists tools and inventory details. |
| `GET` | `/listar/Ativos` | Lists checkouts that are still open. |
| `GET` | `/buscar/Usuario/:uid` | Retrieves the user linked to an active NFC card. |
| `POST` | `/cadastrar/Usuario` | Creates a user. |
| `GET` | `/listar/Usuarios` | Lists users and their NFC cards. |
| `GET` | `/listar/CartoesNFC` | Lists linked NFC cards. |
| `POST` | `/cadastrar/CartaoNFC` | Links an NFC card to a user. |
| `DELETE` | `/remover/CartaoNFC/:user_cpf` | Removes the card linked to the specified CPF. |

### Example request bodies

#### `POST /registrar/Emprestimo`

```json
{
  "user_cpf": "12345678901",
  "ferramentas": [
    { "ferramenta_id": 1, "quantidade": 2 }
  ]
}
```

#### `POST /registrar/Devolucao`

```json
{
  "emprestimo_id": 1,
  "user_cpf": "12345678901"
}
```

#### `POST /cadastrar/Usuario`

```json
{
  "cpf": "12345678901",
  "nome": "Example User",
  "senha": "example-password",
  "tipo": "OPERADOR",
  "setor": "MONTAGEM"
}
```

Supported user roles are `ALMOXARIFE`, `OPERADOR`, and `ADMIN`. See the [Prisma schema](prisma/schema.prisma) for supported departments.

## NFC, MQTT, and Socket.IO

On startup, the API connects to the public broker at `mqtt://broker.hivemq.com:1883` and subscribes to `gof/nfc/request`.

- Publish a JSON message such as `{ "uid": "YOUR_CARD_UID" }` to `gof/nfc/request`.
- The API responds on `gof/nfc/response` with `PERMITIDO` if the card is valid or `ERRO` if authentication fails.
- After successful authentication, the server emits the Socket.IO event `nfcAuth` with the card UID and operator details.

## Project structure

```text
├── middlewares/       # JWT validation
├── prisma/            # Database schema
├── routes/            # Public and protected routes
├── services/          # NFC card authentication
├── mqtthandler.js     # MQTT broker integration
└── server.js          # HTTP and Socket.IO startup
```

## Database

The [Prisma schema](prisma/schema.prisma) defines users, cards, tools, inventory, checkouts, and returns. Use Prisma Studio to inspect the data locally.

```bash
npx prisma studio
```
