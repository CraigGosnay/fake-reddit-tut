import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import mikroConfig from "./mikro-orm.config";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from 'type-graphql';
import { HelloResolver} from './resolvers/hello';
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig); // connect to db
  await orm.getMigrator().up(); // apply migrations

  const app = express(); // start server app
  const apolloServer = new ApolloServer({ // setup graphql server
    schema: await buildSchema({ // generate graphql schema from our resolvers
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: () => ({ em: orm.em }) // can access these vars in resolvers
  })

  apolloServer.applyMiddleware({app}); 

  app.listen(4000, () => {
    console.log("server listening on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
