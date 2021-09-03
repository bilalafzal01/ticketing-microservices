import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { natsWrapper } from '../../nats-wrapper'

it('returns a 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'Valid title', price: 20 })
    .expect(404)
})

it('returns a 401 (not authenticated) if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'Valid title', price: 20 })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
  const title = 'new title'
  const price = 10
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'Valid title', price: 20 })
    .expect(401)
})

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 10,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 20 })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Validdd title', price: -20 })
    .expect(400)
})

it('updates the tickets provided valid inputs', async () => {
  const newTitle = 'new title'
  const newPrice = 20
  const cookie = global.signin()
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'old title',
      price: 10,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200)

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(ticketResponse.body.title).toEqual(newTitle)
  expect(ticketResponse.body.price).toEqual(newPrice)
})

it(`publishes an update event`, async () => {
  const newTitle = 'new title'
  const newPrice = 20
  const cookie = global.signin()
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'old title',
      price: 10,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
