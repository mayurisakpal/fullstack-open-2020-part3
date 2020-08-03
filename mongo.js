const mongoose = require('mongoose')

const password = process.argv[2]

const url = `mongodb+srv://fullstack_open_2020:${password}@cluster0.avq8e.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
} else if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('Phonebook:', '\n')
    result.forEach((item) => {
      console.log(`${item.name} ${item.number} \n`)
    })
    mongoose.connection.close()
  })
} else {
  person.save().then((result) => {
    console.log(`Added ${result.name} number ${result.number} to phonebook \n`)
    mongoose.connection.close()
  })
}
