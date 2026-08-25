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

## Stack Docker local

O ambiente local completo possui quatro containers: `web`, `api`,
`order-worker` e `postgres`. O frontend é servido pelo Nginx e encaminha as
chamadas `/store`, `/health` e `/docs` à API pela rede interna do Docker.

1. Crie seu arquivo local de configuração (ele não é versionado):

```bash
cp .env.example .env
```

2. Defina uma senha forte em `POSTGRES_PASSWORD`. Inclua também as duas
connection strings do Service Bus:

```text
SERVICE_BUS_API_CONNECTION_STRING=<policy streetflow-api-send>
SERVICE_BUS_WORKER_CONNECTION_STRING=<policy streetflow-worker-listen>
```

As duas variáveis evitam que a API e o Worker compartilhem credenciais. A API
tem somente `Send`; o Worker tem somente `Listen`.

3. Inicie tudo:

```bash
npm run docker:up
```

Com o worker configurado, os endereços locais são:

- Frontend: http://localhost:3001
- API: http://localhost:3000
- Swagger: http://localhost:3001/docs

Para desligar a stack, execute `npm run docker:down`. Os dados locais do banco
ficam no volume nomeado `postgres_data`.

## Arquitetura Docker em produção

Em produção, os processos são imagens Docker independentes no Azure Container
Apps:

```text
Internet → streetflow-web (externo, porta 80)
               └→ streetflow-api (ingress interno, porta 3000)
                      ├→ Azure Database for PostgreSQL
                      └→ Azure Service Bus

streetflow-order-worker (sem ingress)
  ├→ Azure Database for PostgreSQL
  └→ Azure Service Bus
```

O PostgreSQL local fica em container. Em produção, use Azure Database for
PostgreSQL: banco de dados precisa de armazenamento, backup, atualização e alta
disponibilidade que não devem depender de um container de aplicação.

### Container Apps a criar

| App | Imagem no ACR | Ingress | Porta | Réplicas |
| --- | --- | --- | --- | --- |
| `streetflow-web` | `streetflow-web` | External | 80 | mínimo 1 |
| `streetflow-api` | `streetflow-api` | Internal | 3000 | mínimo 1 |
| `streetflow-order-worker` | `streetflow-order-worker` | Disabled | — | mínimo 1 |

No `streetflow-web`, defina `API_UPSTREAM=http://streetflow-api`. A API recebe
a chave do Service Bus com somente `Send`; o worker recebe uma chave separada
com somente `Listen`.

Para PostgreSQL em produção, prefira Managed Identity: `DB_AUTH_MODE=managed-identity`,
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DATABASE_SSL=true`. Nesse modo,
`DATABASE_URL` não é usada nem contém senha. A API e o worker obtêm tokens
temporários do Microsoft Entra ID. No ambiente atual, `DB_NAME=postgres`; esse
valor precisa corresponder ao banco usado pela configuração anterior. O modo com
`DATABASE_URL` permanece somente como compatibilidade e rollback durante a
migração.

### Pipeline de containers

O workflow `.github/workflows/containers.yml` substitui os deploys de Web App e
Static Web App. Antes de fazer merge em `main`, configure no GitHub:

- Secret `AZURE_CREDENTIALS`: credencial JSON de um service principal com
  permissão de `AcrPush` no ACR e `Contributor` nos Container Apps.
- Variable `ACR_NAME`: `streetflowregistry`.
- Variable `AZURE_RESOURCE_GROUP`: resource group dos Container Apps.
- Variables `CONTAINER_APP_API_NAME`, `CONTAINER_APP_WEB_NAME` e
  `CONTAINER_APP_WORKER_NAME`: nomes dos três apps.

O pipeline constrói imagens `linux/amd64`, envia as tags `latest` e SHA do
commit ao ACR e atualiza cada Container App com a imagem imutável do commit.

## Build

```bash
npm run build
```

## Banco de dados

Em desenvolvimento, o Docker Compose fornece a `DATABASE_URL` automaticamente
para API e worker. Fora do Compose, configure uma `DATABASE_URL` local ou as
variáveis `POSTGRES_*` em seu ambiente de desenvolvimento.

Em produção (`NODE_ENV=production`), há dois modos:

- `DATABASE_URL`: compatibilidade temporária, com credencial armazenada em
  secret.
- `DB_AUTH_MODE=managed-identity`: modo recomendado; requer `DB_HOST`,
  `DB_PORT`, `DB_NAME`, `DB_USER` e uma Managed Identity com papel criado no
  Azure Database for PostgreSQL. Não há senha nem connection string persistida.

O TypeORM não sincroniza o schema automaticamente em produção quando
`TYPEORM_SYNCHRONIZE=false` está definido.

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
O consumer é o projeto `apps/order-worker`, descrito abaixo.

## Worker de pedidos

`apps/order-worker` consome a assinatura `processamento-pedidos`. Ao receber
`PedidoCriado`, ele atualiza o pedido `PENDING` para `COMPLETED` e confirma a
mensagem somente após a transação do banco concluir. O processamento é
idempotente: receber novamente um pedido já concluído não cria outro efeito.

Para executá-lo localmente:

```bash
export SERVICE_BUS_CONNECTION_STRING='<connection-string-do-namespace>'
export SERVICE_BUS_ORDERS_TOPIC='pedidos'
export SERVICE_BUS_ORDERS_SUBSCRIPTION='processamento-pedidos'
npm run dev:worker
```

Para gerar e enviar uma imagem `linux/amd64` de produção ao Azure Container
Registry a partir do Mac Apple Silicon:

```bash
az acr login --name streetflowregistry

docker buildx build \
  --platform linux/amd64 \
  --provenance=false \
  --file apps/order-worker/Dockerfile \
  --tag streetflowregistry.azurecr.io/streetflow-order-worker:v1 \
  --push \
  .
```
