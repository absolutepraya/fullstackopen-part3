const mongoose = require('mongoose')

// exit if command arguments invalid
if (process.argv.length !== 3 && process.argv.length !== 5 ) {
    console.log('command arguments invalid!')
    process.exit(1)
} 

// get all arguments
const password = process.argv[2]

const url = `mongodb+srv://absolutepraya:${password}@phonebook.ktjvqes.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery', false)

// --- connect to MongoDB ---

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', noteSchema)

if (process.argv.length == 3) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
} else {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number
    })
    
    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

// --- end of connect to MongoDB ---