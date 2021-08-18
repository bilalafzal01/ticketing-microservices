import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { app } from '../app'

// * to tell typescript that there is a global function named `signin`
declare global {
  var signin: () => Promise<string[]>
}

let mongo: any

// * hook function that runs before the tests start
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf'

  mongo = await MongoMemoryServer.create()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

// * hook that runs before each of our test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

// * hook that runs after all of our tests have finished
afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

// * global function; only available in the test environment because
// * we are making it in this setup.ts file
global.signin = async () => {
  const email = 'test@test.com'
  const password = 'password'

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201)

  const cookie = response.get('Set-Cookie')

  return cookie
}
