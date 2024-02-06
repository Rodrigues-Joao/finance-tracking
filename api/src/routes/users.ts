import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import fastifyCors from "@fastify/cors";
import { z } from "zod";

const prisma = new PrismaClient( {
    log: ["query"],
} );
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