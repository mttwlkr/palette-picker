exports.seed = function(knex, Promise) {
  return knex('palettes').del()
    .then(() => knex('projects').del())
    .then(() => {
      return Promise.all([
        knex('projects').insert({
          project_name: 'School Project'
        }, 'id')
        .then(project => {
          return knex('palettes').insert([
            { palette_name: 'Sputnik', 
              color1: "#FF220C",
              color2: "#D33E43",
              color3: "#9B7874",
              color4: "#666370",
              color5: "#1C1F33",
              project_id: project[0]
            },
            { palette_name: 'Warm Colors', 
              color1: "#73B4D8",
              color2: "#24C65D",
              color3: "#3FBA66",
              color4: "#9F041C",
              color5: "#C10750",
              project_id: project[0]
            }
          ])
        })
        .then(() => console.log('Seeding complete!'))
        .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};