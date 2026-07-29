# Visalay API

API para controle de empréstimos e devoluções de ferramentas em ambiente industrial. O projeto gerencia usuários, cartões NFC, ferramentas e estoque, além de integrar leitores NFC via MQTT e notificar o cliente em tempo real por Socket.IO.

## Tecnologias

- Node.js com Express 5
- PostgreSQL e Prisma ORM
- JWT em cookies HTTP-only
- bcrypt para senhas
- MQTT (HiveMQ) para leituras NFC
- Socket.IO para eventos em tempo real

## Pré-requisitos

- Node.js 18 ou superior
- Uma instância PostgreSQL acessível

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto:

   ```env
   DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/BANCO"
   JWT_SECRET="uma-chave-secreta-forte"
   PORT=3000
   # Opcional: URL usada pelo ping periódico da própria API
   SELF_PING_URL="http://localhost:3000/"
   ```

3. Gere o cliente do Prisma e aplique o esquema ao banco:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Inicie a API:

   ```bash
   node server.js
   ```

A API fica disponível em `http://localhost:3000` por padrão. O endpoint `GET /` responde com uma confirmação de que o serviço está em execução.

## Autenticação

Os logins gravam um JWT no cookie `token`. As rotas protegidas exigem esse cookie; em aplicações web, envie a requisição com credenciais, por exemplo `credentials: 'include'` no `fetch`.

| Método | Rota | Corpo da requisição |
| --- | --- | --- |
| `POST` | `/login/almoxarife` | `{ "cpf": "...", "senha": "..." }` |
| `POST` | `/login/admin` | `{ "cpf": "...", "senha": "..." }` |
| `POST` | `/login/NFC` | `{ "uid": "..." }` |

## Endpoints protegidos

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/registrar/Emprestimo` | Registra um empréstimo e seus itens. |
| `POST` | `/registrar/Devolucao` | Registra a devolução de um empréstimo. |
| `GET` | `/listar/Emprestimos` | Lista todos os empréstimos com usuário e ferramentas. |
| `GET` | `/listar/Devolucoes` | Lista as devoluções registradas. |
| `GET` | `/listar/Ferramentas` | Lista ferramentas e informações de estoque. |
| `GET` | `/listar/Ativos` | Lista empréstimos que ainda não possuem devolução. |
| `GET` | `/buscar/Usuario/:uid` | Busca o usuário de um cartão NFC ativo. |
| `POST` | `/cadastrar/Usuario` | Cadastra um usuário. |
| `GET` | `/listar/Usuarios` | Lista usuários e seus cartões NFC. |
| `GET` | `/listar/CartoesNFC` | Lista cartões NFC vinculados. |
| `POST` | `/cadastrar/CartaoNFC` | Vincula um cartão NFC a um usuário. |
| `DELETE` | `/remover/CartaoNFC/:user_cpf` | Remove o cartão vinculado a um CPF. |

### Exemplos de corpos

```json
// POST /registrar/Emprestimo
{
  "user_cpf": "12345678901",
  "ferramentas": [
    { "ferramenta_id": 1, "quantidade": 2 }
  ]
}
```

```json
// POST /registrar/Devolucao
{
  "emprestimo_id": 1,
  "user_cpf": "12345678901"
}
```

```json
// POST /cadastrar/Usuario
{
  "cpf": "12345678901",
  "nome": "Nome do usuário",
  "senha": "senha-segura",
  "tipo": "OPERADOR",
  "setor": "MONTAGEM"
}
```

Os tipos de usuário disponíveis são `ALMOXARIFE`, `OPERADOR` e `ADMIN`. Os setores aceitos estão definidos no esquema Prisma em [`prisma/schema.prisma`](prisma/schema.prisma).

## NFC, MQTT e Socket.IO

Ao iniciar, a API se conecta ao broker público `mqtt://broker.hivemq.com:1883` e assina o tópico `gof/nfc/request`.

- Envie uma mensagem JSON como `{ "uid": "SEU_UID" }` para `gof/nfc/request`.
- A API responde em `gof/nfc/response` com `PERMITIDO` quando o cartão é válido ou `ERRO` quando a leitura não pode ser autenticada.
- Em uma autenticação válida, o servidor emite o evento Socket.IO `nfcAuth` com o UID e os dados do operador.

## Estrutura

```text
├── middlewares/       # Validação do JWT
├── prisma/            # Esquema do banco de dados
├── routes/            # Rotas públicas e protegidas
├── services/          # Autenticação de cartões NFC
├── mqtthandler.js     # Integração com o broker MQTT
└── server.js          # Inicialização HTTP e Socket.IO
```

## Banco de dados

O modelo de dados está em [`prisma/schema.prisma`](prisma/schema.prisma), incluindo usuários, cartões, ferramentas, estoque, empréstimos e devoluções. Use o Prisma Studio para inspecionar os dados localmente:

```bash
npx prisma studio
```
