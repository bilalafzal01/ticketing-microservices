import { Publisher, OrderCancelledEvent, Subjects } from '@mafzaltickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
