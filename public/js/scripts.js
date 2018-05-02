$('#new-palette-button').click(newColors)
$('.color-tile').click(lock)
$('#save-project-button').click(saveProject)
$('#save-palette-button').click(savePalette)

// $('body').keyup(function (event) {
//   if (event.keyCode === 32) {
//     newColors()
//   }
// })

function generateRandomColor() {
  return '#'+Math.floor(Math.random()*16777215).toString(16)
}

function lock() {
  $(this).toggleClass('locked')
}

function getTiles() {
  const tile1 = $('#tile-1');
  const tile2 = $('#tile-2');
  const tile3 = $('#tile-3');
  const tile4 = $('#tile-4');
  const tile5 = $('#tile-5');
  return [tile1, tile2, tile3, tile4, tile5];
}

function newColors() {
  const tiles = getTiles();
  tiles.forEach(tile => {
    if (!tile.hasClass('locked')) {
      let randomColor = generateRandomColor()
      tile.css(`background-color`, `${randomColor}`)
      tile.text(randomColor.toUpperCase())
    }
  })
}

function existingProjects(singleProject) {
  console.log(singleProject)
  const project = singleProject.palettes.map( palette => {
    return (`<li class='palette-thumbnail'>
      <p>${palette.palette_name}</p>
      <div class='thumbnail-color-div'>
        <div class='thumbnail-color' style='background-color:${palette.color1};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color2};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color3};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color4};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color5};'></div>
      </div>
      <button class='delete-thumbnail-button'>X</button> 
      </li>`)
  }).join(' ')
  return project
}

async function appendProjects() {
  const projects = await fetchProjects()
  const palettes = await fetchPalettes()

  const projectsWithPalettes = projects.reduce((acc, curr) => {
    const filtered = palettes.filter( palette => {return palette.project_id === curr.id})
    curr.palettes = [...filtered]
    acc.push(curr)
    return acc
  }, [])

  const displayProjects = projectsWithPalettes.map( singleProject => {
    return existingProjects(singleProject)
  }).join(' ')

  $('.existing-projects').append(`<ul>${displayProjects}</ul>`)
}

async function fetchProjects() {
  const response = await fetch('http://localhost:3000/api/v1/projects')
  const projects = await response.json()
  addSelect(projects)
  return projects
}

async function fetchPalettes() {
  const response = await fetch('http://localhost:3000/api/v1/palettes')
  const palettes = await response.json()
  return palettes
}

function saveProject() {
  event.preventDefault();
  const userInput = $('#projectName-input').val();
  const data = { projectName: userInput }
  fetch('http://localhost:3000/api/v1/new-project', {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
  }).then(response => response.json())
  .catch(error => console.error('Error:', error))
  .then(response => console.log('Success:', response));
}

function addSelect(projects) {
  $.each(projects, (index, project) => {
    $('#existing-project-options').append($(`<option>`, {
      value: project.project_name,
      text: project.project_name
    }))
  })
}

function savePalette(event) {
  event.preventDefault();
  const paletteName = $('#paletteName-input').val();
  const tiles = getTiles();
  const color1 = tiles[0].text();
  const color2 = tiles[1].text();
  const color3 = tiles[2].text();
  const color4 = tiles[3].text();
  const color5 = tiles[4].text();
  const data = { paletteName, color1, color2, color3, color4, color5 }
  sendPalette(data)
}

function sendPalette(data) {
  fetch('http://localhost:3000/api/v1/new-palette', {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
  }).then(response => response.json())
  .catch(error => console.error('Error:', error))
  .then(response => console.log('Success:', response));
}

$(document).ready( () => {
  newColors()
  appendProjects()
});
