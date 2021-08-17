import mongoose from 'mongoose'

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

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
})

// * Allows us to make a new User doc via: User.buildUser() function
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
