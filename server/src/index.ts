import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import mikroConfig from "./mikro-orm.config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "./constants";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig); // connect to db
  await orm.getMigrator().up(); // apply migrations

  const app = express(); // start server app

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient(4545);
  
  // order of applying middleware matters
  // redis will be applied first, as we need it in apollo
  app.use( 
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient }),
      secret: "k2p9f2kfphvvvss2m", // to be moved to envs
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // cookie only works in https
        sameSite: 'lax'
      }
    })
  );

  const apolloServer = new ApolloServer({
    // setup graphql server
    schema: await buildSchema({
      // generate graphql schema from our resolvers
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}): MyContext => ({ em: orm.em, req, res }), // can access these vars in resolvers
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server listening on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
