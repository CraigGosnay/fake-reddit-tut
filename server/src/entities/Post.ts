import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity() // defines a DB table
export class Post {
  @PrimaryKey()
  id!: number;

  @Property({ type: "text" }) // db column
  title!: string;

  @Property({ type: "date", onUpdate: () => new Date() })
  createdAt = new Date();

  @Property({ type: "date" })
  updatedAt = new Date();
}
