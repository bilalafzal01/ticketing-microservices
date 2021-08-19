import request from 'supertest'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { app } from '../app'

// * to tell typescript that there is a global function named `signin`
declare global {
  var signin: () => string[]
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
global.signin = () => {
  // * Build a JWT payload. {id, email}
  const payload = {
    id: '1902854ds',
    email: 'test@test.com',
  }
  // * Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // * Build a session object {jwt: MY_JWT}
  const session = { jwt: token }

  // * Turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // * Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // * return a string that is the cookie with the encoded data
  return [`express:sess=${base64}`]
}
