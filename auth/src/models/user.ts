import mongoose from 'mongoose'
import { Password } from '../services/password'

// * An interface that describes the properties required to create a new user
interface UserAttrs {
  email: string
  password: string
}

// * An interface that describes the properties User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build: (attrs: UserAttrs) => UserDoc
}

// * An interface that describe the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string
  password: string
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      },
    },
  }
)

// * using function keyword instead of arrow function because in case of arrow functions,
// * the 'this' keyword refers to the context of whole file. Not what we want.
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

// * Allows us to make a new User doc via: User.buildUser() function
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
