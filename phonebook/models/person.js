const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        // check if the name is at least 3 characters long
        validate : {
            validator: v => {
                const strippedName = v.replace(/\s/g, '')
                return strippedName.length >= 3
            },
            message: props => `${props.value} is not a valid name!`
        }
    },
    number: { 
        type: String, 
        required: true, 
        validate: {
            validator: v => {
                // regex to check for the number pattern
                const patternMatch = /^(?:\d{2,3}-\d+)$/.test(v)
                if (!patternMatch) return false
    
                // check for total digit to be 8 or more
                const digitCount = v.replace(/-/g, '').length
                return digitCount >= 8
            },
            message: props => `${props.value} is not a valid number!`
        },
    },
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)