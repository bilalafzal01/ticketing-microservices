import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'

it('has a route handler listening to /api/orders for get requests', async () => {
  const response = await request(app).get(
    `/api/orders/${mongoose.Types.ObjectId()}`
  )
  expect(response.status).not.toEqual(404)
})

it('requires a proper mongoose id in query params', async () => {
  const user = global.signin()
  await request(app).get(`/api/orders/124`).set('Cookie', user).expect(400)
})

it('fetches the order', async () => {
  // * create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  const user = global.signin()

  // * create an order with this ticket
  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // * fetch this order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(200)

  expect(fetchedOrder.id).toEqual(order.id)
})

it('returns an error if one user tries to fetch another users order', async () => {
  // * create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  const userOne = global.signin()
  const userTwo = global.signin()

  // * create an order with this ticket
  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201)

  // * fetch this order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .expect(401)
})
