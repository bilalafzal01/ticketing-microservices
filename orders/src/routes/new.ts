import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@mafzaltickets/common'
import { body } from 'express-validator'
import { natsWrapper } from '../nats-wrapper'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 60 * 15

router.post(
  `/api/orders`,
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.isValidObjectId(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body
    // * find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      throw new NotFoundError()
    }

    // * make sure that the ticket is not reserved
    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved')
    }

    // * calculate an expiration date for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // * build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      expiresAt: expiration,
      status: OrderStatus.Created,
      ticket,
    })
    await order.save()

    // * publish an event saying that order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    })

    res.status(201).send(order)
  }
)

export { router as newOrderRouter }
