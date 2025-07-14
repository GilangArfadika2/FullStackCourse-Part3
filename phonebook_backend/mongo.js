const mongoose = require('mongoose')

if (process.argv.length < 5) {
  console.log('give password, phonebook name and number as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://admin:${password}@database.vu5ggpl.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=database`

mongoose.set('strictQuery',false)

mongoose.connect(url)

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// })

// const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//   content: 'HTML is easy',
//   important: true,
// })


const phonebookSchema = new mongoose.Schema({
  id:String,
  name:String,
  number:String,
})
const PhonebookModel = mongoose.model('Phonebook', phonebookSchema)

PhonebookModel.find({}).then(result => {

  const newPhonebook = new PhonebookModel({
    id: result.length + 1,
    name : process.argv[3],
    number: process.argv[4]
  })
  newPhonebook.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
})

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })


// Note.find({}).then(result => {
//   result.forEach(note => {
//     console.log(note)
//   })
//   mongoose.connection.close()
// })