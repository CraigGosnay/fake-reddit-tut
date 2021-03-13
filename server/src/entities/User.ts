import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType() // also a graphql type
@Entity() // defines a DB table
export class User {
  @Field(() => Int) // exposes to graphql schema
  @PrimaryKey()
  id!: number;

  @Field(() => String) // gql uses String obj
  @Property({ type: "date", onUpdate: () => new Date() })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date" })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text", unique: true }) // db column
  username!: string;
  
  @Property({ type: "text" }) // hidden db column
  password!: string;
}
