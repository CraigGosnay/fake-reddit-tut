import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig); // connect to db
  await orm.getMigrator().up(); // apply migrations
  // const post = orm.em.create(Post, { title: "my first post" }); // setup sql
  // await orm.em.persistAndFlush(post); // run sql
};

main().catch((err) => {
  console.error(err);
});
