import "reflect-metadata";
import {
  ServiceBusClient,
  type ServiceBusReceivedMessage,
} from "@azure/service-bus";
import { createWorkerDataSource } from "./database";
import { OrderProcessor, type OrderCreatedEvent } from "./order-processor";

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} é obrigatória`);
  return value;
}

const connectionString = requiredEnvironmentValue(
  "SERVICE_BUS_CONNECTION_STRING",
);
const topicName = process.env.SERVICE_BUS_ORDERS_TOPIC?.trim() || "pedidos";
const subscriptionName =
  process.env.SERVICE_BUS_ORDERS_SUBSCRIPTION?.trim() ||
  "processamento-pedidos";

function asOrderCreatedEvent(
  message: ServiceBusReceivedMessage,
): OrderCreatedEvent {
  if (!message.body || typeof message.body !== "object") {
    throw new Error(
      `Mensagem ${message.messageId == null ? "(sem ID)" : String(message.messageId)} sem corpo JSON`,
    );
  }
  return message.body as OrderCreatedEvent;
}

async function bootstrap() {
  const dataSource = createWorkerDataSource();
  await dataSource.initialize();

  const processor = new OrderProcessor(dataSource);
  const client = new ServiceBusClient(connectionString);
  const receiver = client.createReceiver(topicName, subscriptionName, {
    receiveMode: "peekLock",
  });

  const subscription = receiver.subscribe(
    {
      processMessage: async (message) => {
        const event = asOrderCreatedEvent(message);
        await processor.process(event);
        await receiver.completeMessage(message);
        console.info(
          `[worker] pedido ${event.order.id} processado; mensagem ${message.messageId == null ? "(sem ID)" : String(message.messageId)} concluída`,
        );
      },
      processError: (args) => {
        console.error(
          `[worker] erro no Service Bus (${args.errorSource}): ${args.error.message}`,
        );
        return Promise.resolve();
      },
    },
    { maxConcurrentCalls: 1 },
  );

  const shutdown = async (signal: string) => {
    console.info(`[worker] ${signal} recebido; encerrando...`);
    await subscription.close();
    await receiver.close();
    await client.close();
    await dataSource.destroy();
    process.exit(0);
  };
  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  console.info(
    `[worker] escutando ${topicName}/Subscriptions/${subscriptionName}`,
  );
}

void bootstrap().catch((error: unknown) => {
  console.error("[worker] falha fatal ao iniciar", error);
  process.exitCode = 1;
});
