let persons = [
  {
    'id': '1',
    'name': 'Arto Hellas',
    'number': '040-123456'
  },
  {
    'id': '2',
    'name': 'Ada Lovelace',
    'number': '39-44-5323523'
  },
  {
    'id': '3',
    'name': 'Dan Abramov',
    'number': '12-43-234345'
  },
  {
    'id': '4',
    'name': 'Mary Poppendieck',
    'number': '39-23-6423122'
  }
]
//  DATABASE CONNECTION AND SCHEMA DEFINITION
const PhonebookModel = require('./models/phonebookModels')
PhonebookModel.find({}).then(result => {
  let queryPromises = []
  if (result.length === 0) {
    queryPromises = persons.map(person => {
      const existingPerson = new PhonebookModel({
        id: person.id,
        name: person.name,
        number: person.number
      })
      return existingPerson.save().then(result => {
        `added existing ${result.name} number ${result.number} to phonebook`
      })
    })
  }
  Promise.all(queryPromises).then(() => {
    console.log('All phonebook entries processed')
    // mongoose.connection.close()
  }).catch(err => {
    console.error('Error processing phonebook entries:', err)
    // mongoose.connection.close()
  })
})
// APPLICATION LOGIC TO HANDLE PHONEBOOK OPERATIONS
const express = require('express')
const app = express()
const cors = require('cors')
var morgan = require('morgan')
morgan.token('bodyRequest', (req ) => {return JSON.stringify(req.body)})
app.use(cors())
app.use(express.json())
app.use(morgan(':date[web] :method :url :status :res[content-length] - :response-time ms :user-agent :bodyRequest'))
app.use(express.static('dist'))
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})
app.post('/api/persons', (request, response,next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ 'error': 'Name or number is missing' })
  }
  // const personExist = persons.find(person => person.name === body.name)
  PhonebookModel.findOne({ name: body.name }).then(personExist => {
    console.log(personExist)
    if (personExist) {
      return response.status(400).json({ 'error' : 'name must be unique' })
    } else{
      PhonebookModel.find({}).then(result => {
        const newPerson = new PhonebookModel({
          id: (result.length ) .toString(),
          name: body.name,
          number: body.number
        })
        newPerson.save().then(result => response.status(200).json(result) )
      }).catch(error => next(error))
    }
  }
  ).catch(error => next(error))



  // persons = persons.concat(newPerson)
  // response.status(200).json(newPerson)
})
app.get('/api/persons', (request, response,next) => {
  PhonebookModel.find({}).then(result => {
    response.json(result)
  }).catch(error => next(error))
  // response.json(persons)
})
app.get('/api/persons/:id', (request, response,next) => {
  // const id = request.params.id
  // const person = persons.find(person => person.id === id)
  PhonebookModel.findOne({ _id:request.params.id }).then(result => {
    if (!result ){
      return response.status(400).json({ error: 'Person not found' })
    } else {
      response.status(200).json(result)
    }
  }).catch(error => next(error))
})
app.put('/api/persons/:id', (request, response,next) => {
  // const existingPerson = persons.find(person => person.id === request.params.id)
  PhonebookModel.findOne({ _id:request.params.id }).then(result => {
    if (!result ){
      return response.status(400).json({ error: 'Person not found' })
    }  else if (request.body.number === null || request.body.number === ''
      || request.body.name === null || request.body.name === '') {
      return response.status(400).json({ error: 'Name or number is missing' })
    } else {
      const updatedPerson = {
        name: request.body.name,
        number: request.body.number

      }
      PhonebookModel.findOneAndUpdate({ _id: request.params.id }, updatedPerson, { new: true }).then(
        updatedResult => {
          response.status(200).json(updatedResult)
        }
      )
    }
  }
  ).catch(error => next(error))
  // if (!existingPerson){
  //   return response.status(400).json({error: "Person not found"})

  // }
  // else if (request.body.number === null || request.body.number === ""
  //   || request.body.name === null || request.body.name === "") {
  //   return response.status(400).json({error: "Name or number is missing"})
  // }
  // const updatedPerson = {
  //   ...existingPerson,
  //   name:request.body.name,
  //   number:request.body.number
  // }
  // persons = persons.map(person => person.id === request.params.id ? updatedPerson : person)
  // response.status(200).json(updatedPerson)
})
app.delete('/api/persons/:id', (request, response,next) => {
  PhonebookModel.findOne({ _id:request.params.id }).then(result => {
    if (!result ){
      return response.status(400).json({ error: 'Person has already been deleted' })
    } else {
      PhonebookModel.findOneAndDelete({ _id:request.params.id }).then(deleteResult => {
        return response.status(200).json({ meessage: 'Person succesfully deleted' ,name : deleteResult.name })
      }).catch(error => next(error))
    }
  }).catch(error => next(error))
  // const personExist = persons.find(person => person.id === request.params.id)
  // if (!personExist) {
  //    return response.status(400).json({error: 'Person has already been deleted'})
  // }
  // persons = persons.filter(person => person.id !== request.params.id)
  // response.status(200).json({meessage: 'Person succesfully deleted' ,...personExist})
})
app.get('/api/info',(request,response,next) => {
  PhonebookModel.find({}).then(result => {
    const now = new Date()
    const dateString = now.toString()
    response.status(200).send(`<p> Phonebook has info for ${result.length} people</p>\n<p>${dateString}</p>`)
  }).catch(error => next(error))  })
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
// handler of requests with unknown endpoint
app.use(unknownEndpoint)
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } next(error)
}
app.use(errorHandler)