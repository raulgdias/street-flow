import { randomUUID } from 'node:crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OutboxEventType {
  ORDER_CREATED = 'PedidoCriado',
}

@Entity({ name: 'outbox_events' })
export class OutboxEventEntity {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: OutboxEventType;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ name: 'publish_attempts', type: 'integer', default: 0 })
  publishAttempts: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
