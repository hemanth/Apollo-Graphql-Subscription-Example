const { ApolloServer, gql, PubSub } = require("apollo-server");

// This  should be some DB
const inMemDB = [];

// PubSub event
const pubsub = new PubSub();
const COMMENT_ADDED = "COMMENT_ADDED";

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
    comments: [String]
  }
  type Mutation {
    addComment(body: String!): Boolean!
  }
  type Subscription {
    newComment: String!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (root, args, context) => "Hello Home!",
    comments: (root, args, context) => inMemDB
  },
  Mutation: {
    addComment: (root, { body }, context) => {
      inMemDB.push(body);
      pubsub.publish(COMMENT_ADDED, { newComment: body });
      return true;
    }
  },
  Subscription: {
    newComment: {
      subscribe() {
        return pubsub.asyncIterator([COMMENT_ADDED]);
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

/*

subscription {
  newComment
}

mutation {
  addComment(body: "Hello Test")
}

*/
