// * faking functionality of real nats wrapper file for testing purposes
export const natsWrapper = {
  client: {
    // * this is a mock function
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback()
        }
      ),
  },
}
