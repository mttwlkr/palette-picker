const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(express.static('public'))
app.use(bodyParser.json())

app.set('port', process.env.PORT || 3000);

app.locals.title = 'Palette Picker';

app.post('/api/v1/projects', (request, response) => {
  if (!request.body) {
    return response.status(422).send({ error: 'No Project Name' })
  }

  database('projects').insert(request.body, 'id')
    .then( project => {
      response.status(201).json({ id: project[0] })
    })
    .catch( error => {
      response.status(500).json({ error })
    })
})

app.post('/api/v1/palettes', (request, response) => {
  if (!request.body) {
    return response.status(422).send({Error: "No Project Name"})
  }

  database('palettes').insert(request.body, 'id')
    .then( palette => {
      response.status(201).json({ id: palette[0] })
    })
    .catch( error => {
      response.status(500).json({ error })
    })
})

app.get('/', (request, response) => {
  app.use(express.static(path.join(__dirname, 'public')));
})

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then((projects) => {
      response.status(200).json(projects);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
})

app.get('/api/v1/palettes', (request, response) => {
  database('palettes').select()
    .then((palettes) => {
      response.status(200).json(palettes)
    })
    .catch((error) => {
      response.status(500).json({ error })
    })
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}`)
})

