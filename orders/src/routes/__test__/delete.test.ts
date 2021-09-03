import { OrderStatus } from '@mafzaltickets/common'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import { Ticket } from '../../models/ticket'

it('has a route handler listening to /api/orders for delete requests', async () => {
  const response = await request(app).delete(
    `/api/orders/${mongoose.Types.ObjectId()}`
  )
  expect(response.status).not.toEqual(404)
})

it('requires a proper mongoose id in query params', async () => {
  const user = global.signin()
  await request(app).delete(`/api/orders/124`).set('Cookie', user).expect(400)
})

it('marks an order as cancelled', async () => {
  // * create a ticket with ticket model
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  const user = global.signin()

  // * make a request to create an order
  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // * make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  // * expectation to make sure that thing is cancelled
  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it.todo('publishes an event when an order is cancelled')
