import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  })
  await ticket.save()
  return ticket
}

it('has a route handler listening to /api/orders for get requests', async () => {
  const response = await request(app).get(`/api/orders`)
  expect(response.status).not.toEqual(404)
})

it('fetches orders for a particular user', async () => {
  // * create 3 tickets
  const ticketOne = await buildTicket()
  const ticketTwo = await buildTicket()
  const ticketThree = await buildTicket()

  const userOne = global.signin()
  const userTwo = global.signin()

  // * create one order as User #1
  await request(app)
    .post(`/api/orders`)
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201)

  // * create two orders as User #2
  const { body: orderOne } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201)
  const { body: orderTwo } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201)

  // * fetch orders for User #2
  const response = await request(app)
    .get(`/api/orders`)
    .set('Cookie', userTwo)
    .expect(200)

  // * expect to receive only orders for User #2
  expect(response.body.length).toEqual(2)
  expect(response.body[0].id).toEqual(orderOne.id)
  expect(response.body[1].id).toEqual(orderTwo.id)

  expect(response.body[0].ticket.id).toEqual(ticketTwo.id)
  expect(response.body[1].ticket.id).toEqual(ticketThree.id)
})