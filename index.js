const express = require('express')
const app = express()
const port = 3000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://bluekmky:bluecode0523@boilerplate-fwzva.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: true
}).then(()=> console.log('mongoDb connect'))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send("hello world!"))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

