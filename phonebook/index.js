const http = require('http')
const express = require('express')
const app = express()

app.use(express.json())

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

// path: /info
app.get('/info', (req, res) => {
    const date = new Date()
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
})

// path: /api/persons
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

// path: /api/persons/:id
app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(person => person.id.toString() === id)

    person
        ? res.json(person)
        : res.status(404).end()
})

// delete person
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

// generate id using math random from 1 to 1000000
const generateId = () => {
    const id = persons.length > 0
        ? Math.floor(Math.random() * 1000000)
        : 0
    console.log(`random generated id: ${id}`)
    return id
}

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

    // check if name already exists
    const nameExists = persons.find(person => person.name === body.name)
    if (nameExists) {
        console.log(`${body.name} already exists`)
        return res.status(400).json({
            error: `${body.name} already exists`
        })
    }

    // create new person
    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    // add person to persons
    persons = persons.concat(person)

    res.json(person)
})

// port 3001
const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})