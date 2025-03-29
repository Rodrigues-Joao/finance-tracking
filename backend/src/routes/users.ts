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
    fastify.get( "/", async ( req, res ) =>
    {

        const users = await prisma.user.findMany();
        return res.status( 200 ).send( { users } );
    } );

    fastify.post( "/", async ( req, res ) =>
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
        return res.status( 201 ).send( { response } )
    } )

    fastify.get( "/:id", {
        schema: {
            tags: ["users"],
            response: {
                200: z.object( {
                    response: z.object( {
                        id: z.number(),
                        name: z.string().nullable(),
                        email: z.string()
                    } )
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
        return res.status( 200 ).send( { response } )
    } )
}