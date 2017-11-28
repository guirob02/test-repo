// un commentaire 
// deuxieme
'use strict';

require('dotenv').config({
  silent: true
});

var express = require('express'); // app server
var app = express();
var extend = require('extend');
var bodyParser = require('body-parser'); // parser for post requests
var rq = require('request');
var rp = require('request-promise');
var async = require('async');

// Bootstrap application settings
require('./config/express')(app);

// Orchestrator domain & endpoints declared on the .env file
var domain = process.env.API_DOMAIN;
var authEndpoint = process.env.AUTHENTICATION;
var intentsEndpoint = process.env.INTENTS;
var entitiesEndpoint = process.env.ENTITIES;
var answersEndpoint = process.env.ANSWERS;
var refreshEndpoint = process.env.REFRESH;
var userAuthEndpoint = process.env.USER_AUTH;
var filesEndpoint = process.env.FILES;

var _23hours = 23 * 60 * 60 * 1000; // orchestrator's token validity in hours (max 24hrs)
var auth_token;

// Request new toekn from the orchestrator's server
var auth = function() {
  var payload = {
    app_ID: process.env.API_USER,
    password: process.env.API_PASS
  };
  var options = {
    url: domain + authEndpoint,
    form: payload,
  };

  rq.post(options, function(err, response, body) {
    if (err) {
      console.log("Error auth: " + err);
    } else {
      body = JSON.parse(body);
      if (body.success) {
        auth_token = body.token;
      } else {
        console.log("Error auth: wrong user/password");
      }
    }
  });
}
auth();
setInterval(auth, _23hours);

// Endpoint to call for users authentification
app.get('/auth/check', function(req, res) {
  var usr = req.query.usrID;
  var psw = req.query.pswID;
  var role = req.query.role;

  var options = {
    url: domain + userAuthEndpoint,
    headers: {
      'x-access-token': auth_token
    },
    form: {
      user_ID: req.query.usrID,
      password: req.query.pswID,
      role: req.query.role
    }
  };

  rq.post(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (JSON.parse(body).success) {
        res.json(1);
      } else {
        res.json(0);
      }
    }
  });
});

function B64DecodeUni(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

// Initialization of the Answer Store content (answers, intents, entities)
app.get('/init', function(req, res) {
  var options = {
    url: domain + refreshEndpoint,
    headers: {
      'x-access-token': auth_token
    }
  };

  rq.get(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      async.parallel({
        entities: getContent.bind(null, entitiesEndpoint),
        intents: getContent.bind(null, intentsEndpoint),
        answers: getContent.bind(null, answersEndpoint)
      }, function(err, result) {
        if (err) {
          res.status(500).send(err);
        } else {
          result = extend({}, {
            intent_warnings: JSON.parse(body).intent_warnings,
            answer_warnings: JSON.parse(body).answer_warnings,
            domain: domain
          }, result.entities, result.intents, result.answers);
          res.json(result);
        }
      });
    }
  });
});

var getContent = function(endpoint, cb) {
  var options = {
    url: domain + endpoint,
    headers: {
      'x-access-token': auth_token
    }
  };
  rq.get(options, function(err, response, body) {
    if (err) {
      cb(err);
    } else {
      cb(null, JSON.parse(body));
    }
  });
}

// Get all answers
app.get('/answers', function(req, res) {
  getContent(answersEndpoint, function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  })
})

// Get a specific answer
app.get('/answers/:answer_ID', function(req, res) {
  var options = {
    url: domain + answersEndpoint + "/" + req.params.answer_ID,
    headers: {
      'x-access-token': auth_token
    }
  };

  rq.get(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(body);
    }
  });
});

app.delete('/answers/:answer_ID', function(req, res) {
  var options = {
    url: domain + answersEndpoint + "/" + req.params.answer_ID,
    headers: {
      'x-access-token': auth_token
    }
  };

  rq.delete(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(JSON.parse(body));
    }
  });
});

//import answers
app.post('/answers/import', function(req, res) {
  var options = {
    url: domain + answersEndpoint + "/import",
    headers: {
      'x-access-token': auth_token
    },
    form: {
      answers: req.body
    }
  };

  rq.post(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(body);
    }
  });
});

//import answers
app.get('/replicateDB', function(req, res) {
  var options = {
    url: domain + "/api/replicate",
    headers: {
      'x-access-token': auth_token
    }
  };

  rq.get(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(body);
    }
  });
});


// Update an answer
app.post('/answers/:answer_ID', function(req, res) {
  var options = {
    url: domain + answersEndpoint + "/" + req.params.answer_ID,
    headers: {
      'x-access-token': auth_token
    },
    form: req.body
  };
  rp.post(options)
    .then(function(body) {
      res.json(JSON.parse(body));
    })
    .catch(function(err) {
      res.status(err.statusCode).send(JSON.parse(err.error));
    });
});

// Get all intents
app.get('/intents', function(req, res) {
  getContent(intentsEndpoint, function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  })
})

// Get a specific intent
app.get('/intents/:intent_ID', function(req, res) {
  var options = {
    url: domain + intentsEndpoint + "/" + req.params.intent_ID,
    headers: {
      'x-access-token': auth_token
    }
  };

  rq.get(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(body);
    }
  });
});

//import intents
app.post('/intents/import', function(req, res) {
  var options = {
    url: domain + intentsEndpoint + "/import",
    headers: {
      'x-access-token': auth_token
    },
    form: {
      intents: req.body
    }
  };

  rq.post(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(body);
    }
  });
});

// Update an intent
app.post('/intents/:intent_ID', function(req, res) {
  var options = {
    url: domain + intentsEndpoint + "/" + req.params.intent_ID,
    headers: {
      'x-access-token': auth_token
    },
    form: req.body
  };

  rq.post(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(body);
    }
  });
});

// Get all entities
app.get('/entities', function(req, res) {
  getContent(entitiesEndpoint, function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  })
})

//Endpoint for retrieving doc information based on question id
app.get('/docs/:docID', function(req, res) {
  var options = {
    url: domain + filesEndpoint + "/" + req.params.docID,
    headers: {
      'x-access-token': auth_token
    }
  };

  rq.get(options, function(err, response, body) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(body);
    }
  });
});


// error-handler settings
require('./config/error-handler')(app);

module.exports = app;
