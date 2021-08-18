import request from 'supertest'
import { app } from '../../app'

it('returns a 200 on successful signin', async () => {
  await request(app)
    .post(`/api/users/signup`)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201)
  return request(app)
    .post(`/api/users/signin`)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200)
})

it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post(`/api/users/signup`)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201)
  return request(app)
    .post(`/api/users/signin`)
    .send({ email: 'test@test.com', password: '2' })
    .expect(400)
})

it('fails when a email does not exist', async () => {
  return request(app)
    .post(`/api/users/signin`)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(400)
})

it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post(`/api/users/signup`)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201)
  const response = await request(app)
    .post(`/api/users/signin`)
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200)

  return expect(response.get('Set-Cookie')).toBeDefined()
})
