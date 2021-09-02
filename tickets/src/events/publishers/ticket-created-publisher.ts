import { Publisher, Subjects, TicketCreatedEvent } from '@mafzaltickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
