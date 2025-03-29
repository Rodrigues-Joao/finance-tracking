import { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { z } from "zod";
import * as bcrypt from "bcrypt"
import { prisma } from "../lib/prisma";
import { FastifyTypedInstance } from "../fastify-config-instance";
import { UserService } from "../services/user-service";

type User = {
    id: number | null;
    name: string;
    email: string;

}

type Requestuser = {
    id: string;
}

export async function UserController( fastify: FastifyTypedInstance )
{
    fastify.get( "/", {
        schema: {
            tags: ["users"],
            response: {
                200: z.object( {
                    users: z.array( z.object( {
                        id: z.number(),
                        name: z.string().nullable(),
                        email: z.string()
                    } ) )
                } )
            }
        }
    }, async ( req, res ) =>
    {

        const users = await UserService.getAll()
        return res.status( 200 ).send( { users } );
    } );

    fastify.post( "/", {
        schema: {
            tags: ["users"],
            body: z.object( {
                name: z.string(),
                email: z.string().email( { message: "Invalid email" } ),
                password: z.string().min( 8, { message: "Password must be at least 8 characters" } ).refine( ( password ) => /[A-Z]/.test( password ), {
                    message: "Password must contain at least one uppercase letter",
                } )
                    .refine( ( password ) => /[a-z]/.test( password ), {
                        message: "Password must contain at least one lowercase letter",
                    } )
                    .refine( ( password ) => /[0-9]/.test( password ), {
                        message: "Password must contain at least one number",
                    } )
                    .refine( ( password ) => /[!@#$%^&*]/.test( password ), {
                        message: "Password must contain at least one special character",
                    } )
            } ),
            response: {
                201: z.object( {
                    userId: z.number(),
                } ),
                400: z.object( {
                    message: z.string()
                } )
            }
        }
    }, async ( req, res ) =>
    {

        const user = req.body
        const userId = await UserService.create( user )

        return res.status( 201 ).send( userId )
    } )

    fastify.get( "/:id", {
        schema: {
            tags: ["users"],
            params: z.object( {
                id: z.coerce.number()
            } ),
            response: {
                200: z.object( {
                    id: z.number(),
                    name: z.string().nullable(),
                    email: z.string(),
                    password: z.string().optional()
                } ),
                404: z.object( {
                    message: z.string()
                } )

            }
        }
    }, async ( req, res ) =>
    {
        const { id } = req.params
        const user = await UserService.getById( id )
        return res.status( 200 ).send( { ...user, id } )
    } )
}