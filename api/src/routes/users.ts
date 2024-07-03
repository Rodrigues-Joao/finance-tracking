import { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { z } from "zod";
import { prisma } from "../lib/prisma";

type User = {
    id: number | null;
    name: string;
    email: string;

}

type Requestuser = {
    id: string;
}

export async function Users( fastify: FastifyInstance )
{
    fastify.get( "/", async ( req, res ) =>
    {

        const users = await prisma.user.findMany();
        return res.status( 200 ).send( { users } );
    } );

    fastify.post( "/", async ( req, res ) =>
    {
        const createUserBody = z.object( { name: z.string(), email: z.string().email() } )
        const user = createUserBody.parse( req.body )
        const response = await prisma.user.create( {
            data: {
                name: user.name,
                email: user.email,

            }
        } );
        return res.status( 201 ).send( { response } )
    } )
    fastify.post( "/login", async ( req, res ) =>
    {
        const createUserBody = z.object( { email: z.string().email() } )
        const userBody = createUserBody.parse( req.body )
        const user = await prisma.user.findFirst( {

            where: {

                email: userBody.email,
            }


        } );
        return res.status( 200 ).send( { user } )
    } )
    fastify.get( "/:id", async ( req, res ) =>
    {
        const { id } = req.params as Requestuser
        const response = await prisma.user.findFirst( {
            where: {
                id: parseInt( id )
            }
        } );
        return res.status( 200 ).send( { response } )
    } )
}