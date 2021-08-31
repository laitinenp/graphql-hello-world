const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  input SensorInput {
	id: String!
	value: Float
	unit: String
	documentation: String
  }

  type Sensor {
    _id: ID!
	id: String!
    value: Float
    unit: String
	documentation: String
  }

  type Query {
    getSensor(id: String): Sensor
  }

  type Mutation {
    createSensor(input: SensorInput): Sensor
    updateSensor(id: String, input: SensorInput): Sensor
  }
`);

// If Message had any complex fields, we'd put them on this object.
class Sensor {
  constructor(_id, {id, value, unit, documentation}) {
    this._id = _id
	this.id = id
    this.value = value
    this.unit = unit
	this.documentation = documentation
  }
}

// Maps username to content
var fakeDatabase = {}

const root = {
  getSensor: function ({id}) {
    if (!fakeDatabase[id]) {
      throw new Error('no sensor exists with id ' + id);
    }
    return new Sensor(id, fakeDatabase[id])
  },
  createSensor: function ({input}) {
    // Create a random id for our "database".
    var id = input.id

    fakeDatabase[id] = input
    return new Sensor(id, input)
  },
  updateSensor: function ({id, input}) {
    if (!fakeDatabase[id]) {
      throw new Error('no sensor exists with id ' + id);
    }
    // This replaces all old data, but some apps might want partial update.
    fakeDatabase[id] = input
    return new Sensor(id, input)
  },
};

const app = express()

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});