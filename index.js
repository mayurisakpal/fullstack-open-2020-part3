require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('entry', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

app.use(
  morgan(':method :url :status :res[content-length] :response-time ms :entry')
)

app.get('/api/persons', (req, res) => {
  Person.find({}).then((item) => {
    res.json(item)
  })
})

app.get('/info', (req, res) => {
  Person.countDocuments({}).then((count) => {
    const messageContent = `<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`
    res.send(messageContent)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then(() => res.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/persons/', (req, res, next) => {
  const data = req.body

  if (!data.name) {
    return res.status(400).json({ error: 'Name is missing' })
  } else if (!data.number) {
    return res.status(400).json({ error: 'Number is missing' })
  }

  const newEntry = new Person({
    name: data.name,
    number: data.number,
  })

  newEntry
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((savedAndFormattedPerson) => res.json(savedAndFormattedPerson))
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  const entry = {
    name: req.body.name,
    number: req.body.number,
  }

  Person.findByIdAndUpdate(id, entry, { new: true })
    .then((updatedEntry) => {
      if (updatedEntry) {
        res.json(updatedEntry.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
