import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { Order, OrderStatus } from './order'

interface TicketAttrs {
  id: string
  title: string
  price: number
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  isReserved(): Promise<boolean>
  version: number
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build: (attrs: TicketAttrs) => TicketDoc
  findByEvent: (event: {
    id: string
    version: number
  }) => Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema(
  {},
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: TicketAttrs) =>
  new Ticket({ _id: attrs.id, title: attrs.title, price: attrs.price })

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  })
}

ticketSchema.methods.isReserved = async function () {
  // * here, this === the ticket document that we just called 'isReserved' on

  // * make sure that the ticket is not reserved
  // * run query to look at all orders. find an order where the ticket is
  // * the ticket we just found *and* the order status is *not* cancelled
  // * if we find an order, that means the ticket is reserved
  const existingOrder = await Order.findOne({
    ticket: this as TicketDoc,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  })
  return !!existingOrder
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
