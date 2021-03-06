$('#new-palette-button').click(newColors);
$('.color-tile').click(lock);
$('#save-project-button').click(saveProject);
$('#save-palette-button').click(savePalette);
$('.existing-projects').on('click', '#delete-thumbnail-button', deletePalette);
$('.existing-projects').on('click', '.palette-thumbnail', showPalette);

function generateRandomColor() {
  return "#" + Math.random().toString(16).slice(2, 8)
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

function getCurrentProject() {
  const currentProjectId = $("#existing-project-options").find(":selected").val();
  return currentProjectId
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

function existingProjects(palettes) {
  const pallete = palettes.map( palette => {
    return (`<li class='palette-thumbnail' id='${palette.id}'>
      <p class='thumbnail-palette-name'>${palette.palette_name}</p>
      <div class='thumbnail-color-div'>
        <div class='thumbnail-color' style='background-color:${palette.color1};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color2};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color3};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color4};'></div>
        <div class='thumbnail-color' style='background-color:${palette.color5};'></div>
      </div>
      <button id='delete-thumbnail-button'>X</button> 
      </li>`)
  }).join(' ')
  return pallete
}

function existingProjectDivs(project) {
  const projectHeader = (`<div class='existing-project-thumbnail' id='${project.project_name}' data-id=${project.id}>
    <h3 class='project-thumbnail-name'>${project.project_name}</h3>
    ${existingProjects(project.palettes)}
    </div>`)
  return projectHeader
}

async function loadProjects() {
  const projects = await fetchProjects()
  const palettes = await fetchPalettes()

  const projectsWithPalettes = projects.reduce((acc, curr) => {
    const filtered = palettes.filter( palette => { return palette.project_id === curr.id })
    curr.palettes = [...filtered]
    acc.push(curr)
    return acc
  }, [])

  const displayProjects = projectsWithPalettes.map( singleProject => {
    return existingProjectDivs(singleProject)
  }).join(' ')

  appendProjects(displayProjects)
}

function appendProjects(projects) {
  $('.existing-projects').append(`${projects}`)
}

async function fetchProjects() {
  const response = await fetch('/api/v1/projects')
  const projects = await response.json()
  addSelect(projects)
  return projects
}

async function fetchPalettes() {
  const response = await fetch('/api/v1/palettes')
  const palettes = await response.json()
  return palettes
}

async function saveProject() {
  event.preventDefault();
  const userInput = $('#projectName-input').val();
  const currentProjects = await fetchProjects();
  const alreadyExists = currentProjects.filter( project => {return project.project_name === userInput})
  
  if (!alreadyExists.length && userInput !== '') {
    const projectName = { project_name: $('#projectName-input').val() };
    try {
      const response = await fetch("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify(projectName),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const data = await response.json()
      const newProjectID = await data.id
      addSingleSelect(projectName, newProjectID)
      appendSingleProject(projectName, newProjectID)
    } catch (error) {
      alert(`${error}. Please enter a project name!`)
      throw error
    }
  } else {
    alert('Please choose another project name!')
  }
}

function addSelect(projects) {
  if (!projects.length) {
    $('#existing-project-options').append(`<option>Please make a project!</option>`)
  } else {
    $('#existing-project-options').empty()
    $.each(projects, (index, project) => {
      $('#existing-project-options').append($(`<option>`, {
        value: project.id,
        text: project.project_name
      }))
    })   
  }
}

async function deletePalette() {
  try {
    const paletteID = {id : $(this).parent('li').attr('id')}
    $(this).parent('li').remove()
    const response = await fetch('/api/v1/palettes', {
      method: "DELETE",
      body: JSON.stringify(paletteID),
      headers: {
        "Content-Type": "application/json"
      },
    })
  } catch (error) {
    throw error
  }
}

function showPalette() {
  const children = [...$(this).find('div').children()]
  children.forEach((child, index ) => {
    let color = $(child).attr('style').split(':')[1].replace(/[;]$/,'')
    $(`#tile-${index}`).css(`background-color`, color).text(color)
  })
}

function addSingleSelect(projectName, projectID) {
  $('#existing-project-options').append(`<option selected='selected' value='${projectID}'>${projectName.project_name}</option>`)
}

function savePalette(event) {
  event.preventDefault();
  const palette_name = $('#paletteName-input').val();
  const project_id = getCurrentProject();
  const tiles = getTiles();
  const color1 = tiles[0].text();
  const color2 = tiles[1].text();
  const color3 = tiles[2].text();
  const color4 = tiles[3].text();
  const color5 = tiles[4].text();
  const newPalette = { palette_name, project_id, color1, color2, color3, color4, color5 }
  sendPalette(newPalette)
  return newPalette;
}

async function sendPalette(newPalette) {
  try {
    const response = await fetch('/api/v1/palettes', {
    method: "POST",
    body: JSON.stringify(newPalette),
    headers: {
      "Content-Type": "application/json"
    },
  })
  const new_palette = await response.json()
  await singleProject(new_palette)    
  } catch (error) {
    alert(`${error}. Please enter a palette name!`)
    throw error
  }
}

function appendSingleProject(projectName, newProjectID) {
  const projectHeader = (`<div class='existing-project-thumbnail' id=${projectName.project_name} data-id=${newProjectID}>
    <h3 class='project-thumbnail-name'>${projectName.project_name}</h3>
    <ul></ul>
    </div>`)
  appendProjects(projectHeader)
}

function appendSinglePalette(project, newPalette) {
  const formatted = (`<li class='palette-thumbnail' id='${newPalette.new_palette.id}'>
  <p class='thumbnail-palette-name'>${newPalette.new_palette.palette_name}</p>
  <div class='thumbnail-color-div'>
    <div class='thumbnail-color' style='background-color:${newPalette.new_palette.color1};'></div>
    <div class='thumbnail-color' style='background-color:${newPalette.new_palette.color2};'></div>
    <div class='thumbnail-color' style='background-color:${newPalette.new_palette.color3};'></div>
    <div class='thumbnail-color' style='background-color:${newPalette.new_palette.color4};'></div>
    <div class='thumbnail-color' style='background-color:${newPalette.new_palette.color5};'></div>
  </div>
  <button id='delete-thumbnail-button'>X</button> 
  </li>`)
  $(project).append(formatted)
}

function singleProject(newPalette) {
  const domProjects = $('.existing-project-thumbnail')
  const domProjectArray = [...domProjects];
  const domProject = domProjectArray.forEach( project => {
    const theNumber = parseInt(project.dataset.id)
    if (theNumber === newPalette.new_palette.project_id ) {
      appendSinglePalette(project, newPalette)
    }
  })
}

$(document).ready( () => {
  newColors()
  loadProjects()
});
