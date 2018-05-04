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

app.get('/', (request, response) => {
  app.use(express.static(path.join(__dirname, 'public')));
})

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

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then((projects) => {
      response.status(200).json(projects);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
})

app.post('/api/v1/palettes', (request, response) => {
  if (!request.body) {
    return response.status(422).send({Error: "No Project Name"})
  }

  database('palettes').insert(request.body, ['id', 'palette_name', 'project_id', 'color1', 'color2', 'color3', 'color4', 'color5'])
    .then( palette => {
      response.status(201).json({ 
        new_palette: palette[0]
      })
    })
    .catch( error => {
      response.status(500).json({ error })
    })
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

app.delete('/api/v1/palettes', (request, response) => {
  const { id } = request.body
  database('palettes')
    .where({ 'id': id })
    .del()
    .then((palette) => {
      response.status(204).json(palette)
    })
    .catch((error) => {
      response.status(500).json({ error })
    })
})

app.listen(app.get('port'), () => {
  console.log(`Palette Picker is running on ${app.get('port')}`)
})

module.exports = { app, database }

