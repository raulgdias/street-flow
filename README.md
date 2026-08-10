# Street Flow

Monorepo de MVP de ecommerce com frontend em Next.js e backend em NestJS.

## Estrutura

- `apps/api` - Backend NestJS que oferece endpoints de produtos e autenticação.
- `apps/web` - Frontend Next.js com App Router, pages de loja, carrinho, login e admin.
- `packages/contracts` - Contratos compartilhados do monorepo.

## Tecnologias

- Next.js
- React
- NestJS
- TypeORM
- PostgreSQL
- TurboRepo
- Tailwind CSS

## Instalação

```bash
npm install
```

## Desenvolvimento

Execute backend e frontend em paralelo:

```bash
npm run dev:parallel
```

Se quiser rodar separadamente:

```bash
cd apps/api && npm run start:dev
cd apps/web && npm run dev
```

## Build

```bash
npm run build
```

## Banco de dados

Em desenvolvimento, a API conecta ao PostgreSQL local com estas configurações:

- Host: `localhost`
- Porta: `5432`
- Banco: `streetflow`
- Usuário: `postgres`
- Senha: `Pa@4816905`

Em produção (`NODE_ENV=production`), a conexão usa exclusivamente
`DATABASE_URL`. O TypeORM sincroniza automaticamente as entidades e cria as
tabelas de usuários, produtos, carrinhos e pedidos na inicialização.

A sincronização pode ser desabilitada explicitamente com
`TYPEORM_SYNCHRONIZE=false`. Para provedores de produção que exigem SSL, use
`DATABASE_SSL=true`.

## Endpoints principais

- `GET /store/products` - lista produtos
- `POST /store/products` - cria produto
- `PATCH /store/products/:id` - atualiza produto
- `POST /store/auth/login` - autentica usuário
- `GET /docs` - Swagger no backend

## Observações

- A API roda em `http://localhost:3000`.
- O frontend consome a API para carregar o catálogo e o carrinho.
- Promoções só são aplicadas quando `promoPrice` é menor que `price`.
- Imagens de produtos são cadastradas exclusivamente por URL HTTP/HTTPS.

## Pedidos e Azure Service Bus

O checkout cria o pedido, seus itens e um evento `PedidoCriado` na tabela
`outbox_events` em uma única transação do PostgreSQL. Assim, uma indisponibilidade
temporária do Azure Service Bus não faz o pedido ser perdido.

Após a transação, a API publica os eventos pendentes no tópico configurado. Para
habilitar essa publicação, configure estas variáveis somente no ambiente da API:

```bash
SERVICE_BUS_CONNECTION_STRING=<connection-string-do-namespace>
SERVICE_BUS_ORDERS_TOPIC=pedidos
```

O tópico deve ser criado no Azure antes da API ser iniciada. Sem a connection
string, a API continua aceitando pedidos e mantém os eventos pendentes na outbox.
O consumer da assinatura será implementado separadamente.
