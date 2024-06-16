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
app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
})

// delete person
app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id).then(() => {
        res.status(204).end()
    })
})

// generate id using math random from 1 to 1000000
// const generateId = () => {
//     const id = persons.length > 0
//         ? Math.floor(Math.random() * 1000000)
//         : 0
//     console.log(`random generated id: ${id}`)
//     return id
// }

// add person
app.post('/api/persons', (req, res) => {
    const body = req.body

    // check if body is empty
    if (!body.name || !body.number) {
        console.log('name or number missing')
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    // TODO check if name already exists
    // const nameExists = persons.find(person => person.name === body.name)
    // if (nameExists) {
    //     console.log(`${body.name} already exists`)
    //     return res.status(400).json({
    //         error: `${body.name} already exists`
    //     })
    // }

    // create new person using mongoose model
    const person = new Person({
        name: body.name,
        number: body.number,
        // id: generateId()
    })

    // add person
    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

// unknown endpoint
const unknownEndpoint = (req, res, next) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


// ----------------------------


// port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})