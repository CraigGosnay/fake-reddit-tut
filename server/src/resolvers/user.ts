import { Logger } from "@mikro-orm/core";
import argon2 from "argon2";
import { isInputObjectType } from "graphql";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";

@InputType() // an alternative to individual args in the resolver func
class UsernamePasswordInput {
  @Field() username: string;
  @Field() password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("input") input: UsernamePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    if (input.username.length < 3) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      } as UserResponse;
    }

    if (input.password.length < 3) {
      // use a validation library in real life
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 2",
          },
        ],
      } as UserResponse;
    }

    const hashedPwd = await argon2.hash(input.password);
    const user = ctx.em.create(User, {
      username: input.username,
      password: hashedPwd,
    });

    try {
      await ctx.em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        // code taken from db error msg
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        } as UserResponse;
      }
    }
    return {
      user,
    } as UserResponse;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("input") input: UsernamePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await ctx.em.findOne(User, { username: input.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username not found",
          },
        ],
      } as UserResponse;
    }
    const validLogin = await argon2.verify(user.password, input.password);
    if (!validLogin) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      } as UserResponse;
    }
    return {
      user,
    } as UserResponse;
  }
}
