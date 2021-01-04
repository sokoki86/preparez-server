const express = require('express')
const xss = require('xss')
const UserServices = require('./user-service')

const UserRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    user_id: user.user_id,
    fullname: xss(user.fullname),
    username: xss(user.username),
    email: xss(user.email),
    password: xss(user.password),
})

UserRouter
.route('/user')
.get((req, res, next) => {
    RecipeServices.getUser(
        req.app.get('db')
        )
    .then(user => {
      res.json(user.map(serializeUser))
    })
    .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { fullname, username, email, password} = req.body
    const newUser = { fullname, username, email, password}
    
    for (const [key, value] of Object.entries(newUser))
      if (value == null) {
          return res.status(400).json({
              error: { message: `Missing '${key}' in request body` }
          })
      }

    UserServices.insertUser(
      req.app.get('db'),
      newUser
    )
    .then(user => {
      res
      .status(201)
      .location(`/user/${user.user_id}`)
      .json(serializeUser(user))
    })
    .catch(next)
  })

  userRouter
  .route('/:user_id')
  .all((req, res, next) => {
      RecipeServices.getById(
          req.app.get('db'),
          req.params.user_id
      )
      .then(user => {
          if (!user) {
              return res.status(404).json({
                  error: { message: `User doesn't exist` }
              })
          }
          res.user = user
        })
          .catch(next)
      })
    .get((req, res, next) => {
        res.json(serializeUser(res.user))
    })
.delete((req, res, done) => {
      UserServices.deleteUser(
          req.app.get('db'),
          req.params.user_id
      )
      .then(numRowsAffected => {
          res.status(204).end()
      })
      .catch(done)
  })
 
  module.exports = UserRouter