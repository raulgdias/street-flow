# Street Flow no AKS

Os manifests em `base/` implantam frontend, API e worker no namespace
`streetflow`. PostgreSQL, Service Bus e ACR continuam sendo recursos Azure
gerenciados.

Antes do primeiro deploy, crie o secret de runtime no cluster. Não versione as
connection strings:

```bash
kubectl create namespace streetflow --dry-run=client -o yaml | kubectl apply -f -

kubectl -n streetflow create secret generic streetflow-runtime-secrets \
  --from-literal=service-bus-api-connection="$SERVICE_BUS_API_CONNECTION_STRING" \
  --from-literal=service-bus-worker-connection="$SERVICE_BUS_WORKER_CONNECTION_STRING"
```

Depois, aplique os manifests:

```bash
kubectl apply -k k8s/base
```

O workflow `containers.yml` publica as três imagens no ACR e atualiza as
implantações do AKS para a tag imutável do commit. Para o primeiro deploy via
GitHub Actions, o principal de serviço em `AZURE_CREDENTIALS` precisa ter
permissão de Contributor no resource group (o AKS está com contas locais de
admin habilitadas). A variável opcional `AKS_NAME` pode ser configurada no
GitHub; caso contrário, o workflow usa `streetflow-aks`.

API e worker usam Azure Workload Identity para obter token do PostgreSQL. As
connection strings do Service Bus permanecem em `streetflow-runtime-secrets`.
