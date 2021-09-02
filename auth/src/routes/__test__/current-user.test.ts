import request from 'supertest'
import { app } from '../../app'

it('responds with details about the current user', async () => {
  // * doing this because cookies are not retained in the testing environment
  const cookie = await global.signin()

  const response = await request(app)
    .get(`/api/users/currentuser`)
    .set('Cookie', cookie)
    .send()
    .expect(200)

  return expect(response.body.currentUser.email).toEqual('test@test.com')
})

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get(`/api/users/currentuser`)
    .send()
    .expect(200)

  return expect(response.body.currentUser).toBeNull()
})
