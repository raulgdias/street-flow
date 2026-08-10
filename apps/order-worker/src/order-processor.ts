import { DataSource } from "typeorm";

type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

type OrderRow = {
  id: string;
  status: OrderStatus;
};

export type OrderCreatedEvent = {
  eventId: string;
  eventType: "PedidoCriado";
  version: number;
  occurredAt: string;
  order: {
    id: string;
  };
};

export class OrderProcessor {
  constructor(private readonly dataSource: DataSource) {}

  async process(event: OrderCreatedEvent): Promise<void> {
    if (event.eventType !== "PedidoCriado" || !event.order?.id) {
      throw new Error("Mensagem PedidoCriado inválida");
    }

    await this.dataSource.transaction(async (manager) => {
      const [order] = await manager.query<OrderRow[]>(
        "SELECT id, status FROM orders WHERE id = $1 FOR UPDATE",
        [event.order.id],
      );
      if (!order) {
        throw new Error(`Pedido ${event.order.id} não encontrado`);
      }

      if (order.status === "PENDING") {
        await manager.query("UPDATE orders SET status = $1 WHERE id = $2", [
          "COMPLETED",
          order.id,
        ]);
      }
    });
  }
}
