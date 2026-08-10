import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceBusClient, type ServiceBusSender } from '@azure/service-bus';
import { IsNull, Repository } from 'typeorm';
import { OutboxEventEntity } from './entities/outbox-event.entity';

const PUBLISH_INTERVAL_MS = 5_000;
const PUBLISH_BATCH_SIZE = 25;

@Injectable()
export class OrdersPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrdersPublisher.name);
  private client: ServiceBusClient | null = null;
  private sender: ServiceBusSender | null = null;
  private timer: NodeJS.Timeout | null = null;
  private publishing = false;

  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly outboxEvents: Repository<OutboxEventEntity>,
  ) {}

  onModuleInit() {
    const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING?.trim();
    const topicName = process.env.SERVICE_BUS_ORDERS_TOPIC?.trim() || 'pedidos';

    if (!connectionString) {
      this.logger.warn(
        'SERVICE_BUS_CONNECTION_STRING não configurada; eventos de pedidos permanecerão na outbox.',
      );
      return;
    }

    this.client = new ServiceBusClient(connectionString);
    this.sender = this.client.createSender(topicName);
    this.timer = setInterval(
      () => void this.publishPendingEvents(),
      PUBLISH_INTERVAL_MS,
    );
    void this.publishPendingEvents();
  }

  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.sender?.close();
    await this.client?.close();
  }

  private async publishPendingEvents() {
    if (!this.sender || this.publishing) return;
    this.publishing = true;

    try {
      const events = await this.outboxEvents.find({
        where: { publishedAt: IsNull() },
        order: { createdAt: 'ASC' },
        take: PUBLISH_BATCH_SIZE,
      });

      for (const event of events) {
        await this.publishEvent(event);
      }
    } catch (error) {
      this.logger.error('Falha ao buscar eventos pendentes da outbox', error);
    } finally {
      this.publishing = false;
    }
  }

  private async publishEvent(event: OutboxEventEntity) {
    try {
      await this.sender!.sendMessages({
        messageId: event.id,
        subject: event.eventType,
        contentType: 'application/json',
        body: event.payload,
        applicationProperties: {
          eventType: event.eventType,
          eventVersion: 1,
        },
      });

      await this.outboxEvents.update(event.id, {
        publishedAt: new Date(),
        publishAttempts: event.publishAttempts + 1,
        lastError: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.outboxEvents.update(event.id, {
        publishAttempts: event.publishAttempts + 1,
        lastError: message.slice(0, 2_000),
      });
      this.logger.error(`Falha ao publicar evento ${event.id}: ${message}`);
    }
  }
}
