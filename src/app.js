require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const recipesRouter = require('./recipes/recipe-router')


const app = express()


const morganOption = (NODE_ENV === 'production') 
  ? 'tiny'
  : 'common';

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
  }

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/recipes', recipesRouter)

app.get('/xss', (req, res) => {
  res.cookie('secretToken', '1234567890');
  res.sendFile(__dirname + '/xss-example.html');
});


app.get('/', (req, res) => {
    res.send('Hello, world!')
     })

     app.use(function errorHandler(error, req, res, next) {
          let response
          if (NODE_ENV === 'production') {
            response = { error: { message: 'server error' } }
          } else {
            console.error(error)
            response = { message: error.message, error }
          }
          res.status(500).json(response)
        })

module.exports = app