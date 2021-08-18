import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import { app } from '../app'

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
