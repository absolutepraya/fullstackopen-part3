// setup express, morgan, cors, dotenv, mongoose
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()

// use cors, json, static
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

// morgan setup
app.use((req, res, next) => {
    req.parsedBody = JSON.stringify(req.body)
    next()
})
morgan.token('body', (req) => req.parsedBody)
const customFormat = ':method :url :status :res[content-length] - :response-time ms :body'
app.use(morgan(customFormat))


// ---------- routes ----------


// get info
app.get('/info', (req, res) => {
    const date = new Date()
    Person.find({}).then(persons => {
        res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
    })
})

// get all persons
app.get('/api/persons', (req, res) => {
    Person.find({}).then(person => {
        res.json(person)
    })
})

// get person by id
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

// delete person
app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => {
            next(error)
        })
})

// add person
app.post('/api/persons', (req, res) => {
    const body = req.body

    // create new person using mongoose model
    const person = new Person({
        name: body.name,
        number: body.number
    })

    // add person
    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

// update person
app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            if (updatedPerson) {
                res.json(updatedPerson)
            } else {
                const error = new Error('person not found')
                error.name = 'PersonNotFound'
                next(error)
            }
        })
        .catch(error => next(error))
})

// unknown endpoint
const unknownEndpoint = (req, res, next) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// error handling
const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    switch (error.name) {
        case 'CastError':
            res.status(400).send({ error: 'malformatted id' });
            break;
        case 'ValidationError':
            res.status(400).json({ error: error.message });
            break;
        case 'PersonNotFound':
            res.status(404).send({ error: error.message });
            break;
        default:
            res.status(500).json({ error: 'internal server error' });
    }
}

app.use(errorHandler)


// ----------------------------


// port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})