const express = require('express');                   // importing express
const app = express();                                // create app using express's app method
const bodyParser = require('body-parser');            // import body parser

const environment = process.env.NODE_ENV || 'development';          // setting environment to test/production or default to development
const configuration = require('./knexfile')[environment];           // setting knex's configuration to environment from line #5
const database = require('knex')(configuration);      // creating knex database using configurations from 5/6

app.use(express.static('public'))                     // directing the app to use the public directory for the View
app.use(bodyParser.json())                            // use bodyParser to parse the body responses.

app.set('port', process.env.PORT || 3000);            // setting the port to whatever the server wants or 3000 for local host

app.get('/', (request, response) => {                 // route handler for a get request to the root page
  app.use(express.static(path.join(__dirname, 'public')));          // when the root page is loaded, load the public directory for the View
})

app.post('/api/v1/projects', (request, response) => { // route handler for a POST request to /projects, request and response are both objects
  if (!request.body) {                                // if the user did not include a title for the project...
    return response.status(422).send({ Error: 'No Project Name' }) // send a 422 response back with the error 
  }

  database('projects').insert(request.body, 'id')     // insert the new project title in the projects table, return the id
    .then( project => {                               // knex is promise based, so the new project is now referred to as project
      response.status(201).json({ id: project[0] })   // if the project makes it into the database okay, send a 201 response
    })    
    .catch( error => {                              
      response.status(500).json({ error })            // if there was a problem with the database, send a 500 response with the error
    })  
})  
  
app.get('/api/v1/projects', (request, response) => {  // route handler for a GET request to /projects, request and response are both objects
  database('projects').select()                       // select ALL from the projects database. select() is the same as using * is SQL
    .then((projects) => {                             // the projects table is now referred to as projects
      response.status(200).json(projects);            // if the promise resolves, send a 200 status code and send back all the projects in the table database
    })  
    .catch((error) => {                               
      response.status(500).json({ error });           // if there was a problem with the database, send a 500 response with the error
    });
})

app.post('/api/v1/palettes', (request, response) => { // route handler for a POST request to /palettes, request and response are both objects
  if (!request.body.palette_name) {                                // if the user did not include a title for the palette...
    return response.status(422).send({Error: "No Palette Name"})   // send a 422 response back with the error 
  }

  database('palettes').insert(request.body, ['id', 'palette_name', 'project_id', 'color1', 'color2', 'color3', 'color4', 'color5']) // send back the entire new palette to be appended
    .then( palette => {                                 
      response.status(201).json({                     // if the promise resolves, send a 201 status code...
        new_palette: palette[0]                       // with an object named new_palette with all the new palette information
      })
    })
    .catch( error => {
      response.status(500).json({ error })            // if there was a problem with the database, send a 500 response with the error
    })
})

app.get('/api/v1/palettes', (request, response) => {  // route handler for a GET request to /palettes, request and response are both objects
  database('palettes').select()                       // select ALL from the palettes database. select() is the same as using * is SQL
    .then((palettes) => {                             // the palettes table is now referred to as projects
      response.status(200).json(palettes)             // if the promise resolves, send a 200 status code and send back all the palettes in the table database
    })
    .catch((error) => {
      response.status(500).json({ error })            // if there was a problem with the database, send a 500 response with the error
    })
})

app.delete('/api/v1/palettes', (request, response) => { // route handler for a DELETE request to /palettes, request and response are both objects
  const { id } = request.body                         // I realize I could dynamically route this, but I passed in the id in the body instead
  database('palettes')                                // search the palettes database
    .where({ 'id': id })                              // where the id in the db matches the id from the request body
    .del()                                            // delete that row from the palettes database
    .then((palette) => {                              
      response.status(204).json(palette)              // if the promise resolves, send a 204 status code that the request has succeeded and no further action is taken
    })
    .catch((error) => {
      response.status(500).json({ error })            // if there is a problem with the database, send a 500 status code
    })
})

app.listen(app.get('port'), () => {                   // Direct the app to listen for, and then get what port the server is running on
  console.log(`Palette Picker is running on ${app.get('port')}`) // log the app's title and the port it's running on
})

module.exports = { app, database }                    // export both the app and the database configurations for testing.

