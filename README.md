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

A API usa `DATABASE_URL` para conectar ao PostgreSQL. Em produção
(`NODE_ENV=production`), o TypeORM sincroniza automaticamente as entidades e
cria as tabelas de usuários, produtos, carrinhos e pedidos na inicialização.

Em ambientes de preview, essa criação automática também pode ser habilitada
com `TYPEORM_SYNCHRONIZE=true`. Para provedores que exigem SSL, use
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
