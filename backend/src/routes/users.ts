import { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { z } from "zod";
import * as bcrypt from "bcrypt"
import { prisma } from "../lib/prisma";
import { FastifyTypedInstance } from "../fastify-config-instance";

type User = {
    id: number | null;
    name: string;
    email: string;

}

type Requestuser = {
    id: string;
}

export async function Users( fastify: FastifyTypedInstance )
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

        const users = await prisma.user.findMany();
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
                    id: z.number(),
                    name: z.string().nullable(),
                    email: z.string()
                } ),
                400: z.object( {
                    message: z.string()
                } )
            }
        }
    }, async ( req, res ) =>
    {
        const createUserBody = z.object( { name: z.string(), email: z.string().email(), password: z.string() } )
        const user = createUserBody.parse( req.body )
        const salt = await bcrypt.genSalt( 10 )
        const hash = await bcrypt.hash( user.password, salt )
        const response = await prisma.user.create( {
            data: {
                name: user.name,
                email: user.email,
                password: hash

            }
        } );
        if ( !response )

            return res.status( 400 ).send( { message: "User not created" } )

        return res.status( 201 ).send( { ...response } )
    } )

    fastify.get( "/:id", {
        schema: {
            tags: ["users"],
            response: {
                200: z.object( {
                    id: z.number(),
                    name: z.string().nullable(),
                    email: z.string()

                } ),
                404: z.object( {
                    message: z.string()
                } )

            }
        }
    }, async ( req, res ) =>
    {
        const { id } = req.params as Requestuser
        const response = await prisma.user.findFirst( {
            where: {
                id: parseInt( id )
            }
        } );
        if ( !response )
        {
            return res.status( 404 ).send( { message: "User not found" } )
        }
        return res.status( 200 ).send( { ...response } )
    } )
}