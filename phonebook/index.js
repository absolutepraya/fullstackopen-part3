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

// note: some of validation for name and number is already on the frontend

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
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => {
            next(error)
        })
})

// add person
app.post('/api/persons', async (req, res, next) => {
    const body = req.body

    // check if the name or number is missing
    if (!body.name || !body.number) {
        const error = new Error('Name or number is missing')
        error.name = 'ValidationError'
        return next(error)
    }

    try {
        // check if the person already exists with the same name and number
        const persons = await Person.find({ name: new RegExp('^' + body.name + '$', 'i') });
        const matchedPerson = persons.find(person => person.number.replace(/\s|-/g, '') === body.number.replace(/\s|-/g, ''))

        if (matchedPerson) {
            throw new Error(`${body.name} is already added to the phonebook`)
        }

        // create new person using mongoose model
        const person = new Person({
            name: body.name,
            number: body.number
        })

        // add person
        const savedPerson = await person.save()
        res.json(savedPerson)
    } catch (error) {
        error.name = 'ValidationError'
        next(error)
    }
})

// update person
app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            if (updatedPerson) {
                res.json(updatedPerson)
            } else {
                const error = new Error(`${name} is not found`)
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
            res.status(400).send({ error: 'Malformatted ID' });
            break;
        case 'ValidationError':
            res.status(400).json({ error: error.message });
            break;
        case 'PersonNotFound':
            res.status(404).send({ error: error.message });
            break;
        default:
            res.status(500).json({ error: 'Internal server error' });
    }
}

app.use(errorHandler)


// ----------------------------


// port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})