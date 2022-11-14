var express = require('express');
var router = express.Router();
const db = require('../db/index');
const { v4: uuidv4 } = require('uuid');
const {isValidPassword} = require("../helpers/auth");

let authMiddleware = (req, res, next) => {
    db('users_tokens').where({
        'token': req.headers?.authorization || '',
    }).then((results) => {
        if (results.length === 0) {
            res.status(401).json({
                message: "Unauthorized"
            });
        } else {
            next();
        }
    })
};

/* GET users listing. */
router.get('/', authMiddleware, function(req, res, next) {
  // db('users').insert({
  //   login: 'test',
  //   password: 'test',
  // });

  db('users').then((users) => {
    res.json({
      users,
    })
  })
});

router.post('/register', function(req, res, next) {
  const userData = req.body;
  console.log(userData);

  db('users').where({ login: userData.login }).first().then((user) => {
    if (user) {
      res.json({
        message: 'User with this login already registered'
      });
    }

    db('users').insert({
      login: userData.login,
      password: userData.password,
    }).then(() => {
      res.json({
        message: "Successfully"
      });
    });
  })
});

router.post('/login', (req, res) => {
  const userData = req.body;

  db('users').where({ login: userData.login }).first().then((user) => {

    if (!user) {
      res.status(422).json({
        msg: 'Not found user with this login'
      });

      return;
    }

    if (isValidPassword(userData.password, user.password)) {
      const newToken = uuidv4();

      db('users_tokens').del().where({
        'user_id': user.id
      }).then(() => {
        db('users_tokens').insert({
          'user_id': user.id,
          token: newToken,
        }).then(() => {
          res.json({
            message: "Successfully",
            token: newToken,
          })
        })
      });
    } else {
      res.status(422).json({
        msg: 'Incorrect password'
      })
    }
  })
})

module.exports = router;
