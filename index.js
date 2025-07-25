
const express = require('express')
const app = express()
var morgan = require('morgan')


// const unknownEndpoint = (request, response) => {
//   response.status(404).send({ error: 'unknown endpoint' })
// }
morgan.token('bodyRequest', (req , res) => {return JSON.stringify(req.body)})


app.use(express.json())
app.use(morgan(":date[web] :method :url :status :res[content-length] - :response-time ms :user-agent :bodyRequest"));



let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]



app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  if (!body.name || !body.number) {
    return response.status(400).json({"error": 'Name or number is missing'})
  }
 
  const personExist = persons.find(person => person.name === body.name)
  
  if (personExist) {
    return response.status(400).json({"error" : 'name must be unique'})
  }

  const newPerson = {
    id: (Math.random() * 20000),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(newPerson);
  response.status(200).json(newPerson)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (!person) {
    return response.status(400).json({error: 'Person not found'})
  }
  response.status(200).json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const personExist = persons.find(person => person.id === id) ;
  if (!personExist) {
     return response.status(400).json({error: 'Person has already been deleted'})
  }
  persons = persons.filter(person => person.id !== id)
  response.status(200).json({error: 'Person succesfully deleted'})
})

app.get('/api/info',(request,response) => {
  personsSize = persons.length;
  const now = new Date();
  const dateString = now.toString();
  response.status(200).send(`<p> Phonebook has info for ${personsSize} people</p>
  <p>${dateString}</p>`)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})