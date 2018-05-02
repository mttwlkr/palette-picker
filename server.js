const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(express.static('public'))
app.use(bodyParser.json())

app.set('port', process.env.PORT || 3000);

app.locals.title = 'Palette Picker';

app.locals.projects = [
  {
    primaryKey: 5,
    projectName: 'lol cats'
  },
  {
    primaryKey: 7,
    projectName: 'School Project'
  }
]

app.locals.palettes = [
  {
    primaryKey: 1,
    foreignKey: 7,
    paletteName: "Warm Colors",
    "color1": '#FF220C',
    "color2": '#D33E43',
    "color3": '#9B7874',
    "color4": '#666370',
    "color5": '#1C1F33'
  },
  {
    primaryKey: 2,
    foreignKey: 7,
    paletteName: "Cold Colors",
    "color1": '#73B4D8',
    "color2": '#24C65D',
    "color3": '#3FBA66',
    "color4": '#9F041C',
    "color5": '#C10750'
  }  
]

app.post('/api/v1/new-palette', (request, response) => {
  const { paletteName, palette } = request.body;
  const palettes = app.locals.palettes
  const primaryKey = palettes.length + 1;
  const newPalette = Object.assign({}, { paletteName: paletteName }, { palette: palette })
  if (!paletteName) {
    return response.status(422).send({Error: "No Project Name"})
  } else {
    palettes.push(newPalette)
  }
})

app.post('/api/v1/new-project', (request, response) => {
  const { projectName } = request.body;
  const projects = app.locals.projects
  const primaryKey = projects.length + 1;
  const newProject = Object.assign({}, {primaryKey: primaryKey }, { projectName: projectName } );
  if (!projectName) {
    return response.status(422).send({Error: "No Project Name"})
  } else {
    projects.push(newProject)
    return response.status(200).json({ projectName })
  }
})

app.get('/', (request, response) => {
  app.use(express.static(path.join(__dirname, 'public')));
})

app.get('/api/v1/projects', (request, response) => {
  let projects = app.locals.projects;
  response.status(200).json(projects)
})

app.get('/api/v1/palettes', (request, response) => {
  let palettes = app.locals.palettes;
  response.status(200).json(palettes)
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}`)
})

