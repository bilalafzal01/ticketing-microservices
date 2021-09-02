import { Message } from 'node-nats-streaming'
import { Listener, Subjects, TicketCreatedEvent } from '@mafzaltickets/common'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = 'payments-service'

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log(`Received event #${msg.getSequence()}, with data: ${data}`)
    msg.ack()
  }
}
