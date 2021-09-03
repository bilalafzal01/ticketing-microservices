import { Publisher, OrderCreatedEvent, Subjects } from '@mafzaltickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
