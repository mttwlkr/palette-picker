const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const { app, database } = require('../server.js');

chai.use(chaiHttp);

describe('Testing Endpoints', () => {

  beforeEach( (done) => {
    database.migrate.rollback()
    .then( () => {
      database.migrate.latest()
      .then( () => {
        return database.seed.run()
        .then( () => {
          done();
        });
      });
    });
  });

  it('should return a 404 response if the path is invalid', (done) => {
    chai.request(app)
      .get('/api/v1/sadpath')
      .end( (error, response) => {
        response.should.have.status(404)
      })
      done()
  })

  it('should respond with an array of a single project', (done) => {
    chai.request(app)
      .get('/api/v1/projects')
      .end( (error, response) => {
        response.should.be.json
        response.should.have.status(200)
        response.body.should.be.an('array')
        response.body[0].should.have.property('id')
        response.body[0].id.should.equal(1)
      })
      done();
  })

  it('should post to projects', (done) => {
    chai.request(app)
      .post('/api/v1/projects')
      .send({ project_name: 'Alaska' })
      .end( (error, response) => {
        response.body.should.have.property('id')
        response.body.id.should.equal(2)
      })
      done()
  })

  it('should not post if the response is missing a body', (done) => {
    chai.request(app)
      .post('/api/v1/projects')
      .send({
        lol: 'wat'
      })
      .end( (error, response ) => {
        response.should.have.status(500)
      })
      done()
  })

  it('should post to palettes', (done) => {
    chai.request(app)
      .post('/api/v1/palettes')
      .send({
        palette_name: 'Alaska Sunset',
        project_id: 1,
        color1: "#FF220C",
        color2: "#D33E43",
        color3: "#9B7874",
        color4: "#666370",
        color5: "#1C1F33"
      })
      .end( (error, response) => {
        response.should.be.json
        response.should.have.status(201)
        response.body.should.be.an('object')
        response.body.new_palette.should.be.an('object')
        response.body.new_palette.should.have.property('palette_name');
        response.body.new_palette.palette_name.should.equal('Alaska Sunset');
        response.body.new_palette.should.have.property('color1');
        response.body.new_palette.color1.should.equal('#FF220C');
        response.body.new_palette.project_id.should.equal(1);
        response.body.new_palette.should.have.property('color4');
        response.body.new_palette.color4.should.equal("#666370");        
      })
      done()
  })

  it('should not post if the response is missing a body', (done) => {
    chai.request(app)
      .post('/api/v1/palettes')
      .send({
        lol: 'wat'
      })
      .end( (error, response ) => {
        response.should.have.status(422)
      })
      done()
  })

  it('should delete a palette', (done) => {
    chai.request(app)
      .delete('/api/v1/palettes')
      .send({ id: 1 })
      .end( (error, response) => {
        response.statusCode.should.equal(204)
      })
      done()
  })

  it('should respond with an array of existing palettes', (done) => {
    chai.request(app)
      .get('/api/v1/palettes')
      .end( (error, response) => {
        response.should.be.json
        response.should.have.status(200)
        response.body.should.be.an('array')
        response.body.length.should.equal(2)
        response.body[0].should.have.property('palette_name');
        response.body[0].palette_name.should.equal('Sputnik');
        response.body[0].should.have.property('color1');
        response.body[0].color1.should.equal('#FF220C');
        response.body[0].project_id.should.equal(1);
        response.body[1].should.have.property('color4');
        response.body[1].color4.should.equal("#9F041C");
      })
      done();
  })
})