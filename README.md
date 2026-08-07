# Street Flow

Monorepo de MVP de ecommerce com frontend em Next.js e backend em NestJS.

## Estrutura

- `apps/api` - Backend NestJS que oferece endpoints de produtos, autenticação e upload de imagens.
- `apps/web` - Frontend Next.js com App Router, pages de loja, carrinho, login e admin.
- `packages/contracts` - Contratos compartilhados do monorepo.

## Tecnologias

- Next.js
- React
- NestJS
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

## Endpoints principais

- `GET /store/products` - lista produtos
- `POST /store/products` - cria produto
- `PATCH /store/products/:id` - atualiza produto
- `POST /store/products/:id/image` - faz upload de imagem de produto
- `POST /store/auth/login` - autentica usuário
- `GET /docs` - Swagger no backend

## Observações

- A API roda em `http://localhost:3000`.
- O frontend consome a API para carregar o catálogo e o carrinho.
- Promoções só são aplicadas quando `promoPrice` é menor que `price`.
- Upload de imagens cria URLs servidas a partir de `/uploads/`.
