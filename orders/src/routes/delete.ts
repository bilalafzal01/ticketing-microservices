import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@mafzaltickets/common'
import { param } from 'express-validator'
import { Order } from '../models/order'

const router = express.Router()

router.delete(
  `/api/orders/:orderId`,
  requireAuth,
  [
    param('orderId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('orderId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params

    const order = await Order.findById(orderId)

    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    order.status = OrderStatus.Cancelled
    await order.save()

    // * publish an event that this order was cancelled

    res.status(204).send(order)
  }
)

export { router as deleteOrderRouter }
