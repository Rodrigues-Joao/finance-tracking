import { FastifyInstance } from "fastify";


import { z } from "zod";
import { prisma } from "../lib/prisma";


type Account = {
    name: string;
    balance: number;
    userId: number;

}



export async function Accounts( fastify: FastifyInstance )
{
    fastify.get( "", async ( req, res ) =>
    {
        const { userId } = req.query as { userId: string }
        const accounts = await prisma.accounts.findMany( {
            select: {
                id: true,
                name: true,
                balance: true,
            },
            where: {

                userId: parseInt( userId )
            }
        } );
        return res.status( 200 ).send( { accounts } );
    } );
    fastify.get( "/:id", async ( req, res ) =>
    {
        const { id } = req.params as { id: string }
        const { userId } = req.query as { userId: string }
        const accounts = await prisma.accounts.findMany( {
            where: {
                id: parseInt( id ),
                userId: parseInt( userId )
            }
        } );
        return res.status( 200 ).send( { accounts } );
    } );
    fastify.post( "/", async ( req, res ) =>
    {
        const createAccount = z.object( {
            name: z.string(),
            balance: z.number(),
            userId: z.number(),
        } )
        const account = createAccount.parse( req.body )
        const accountCreated = await prisma.accounts.create( {
            data: {
                name: account.name,
                balance: account.balance,
                userId: account.userId

            }
        } )
        return res.status( 201 ).send( { accountCreated } );
    } );
    fastify.put( "/", async ( req, res ) =>
    {
        const updateAccount = z.object( {
            id: z.number(),
            name: z.string(),
            balance: z.number(),
            userId: z.number(),
        } )

        const account = updateAccount.parse( req.body )
        const accountUpdated = await prisma.accounts.update( {
            where: {
                id: account.id
            },
            data: {
                name: account.name,
                balance: account.balance,
            }
        } )
        return res.status( 202 ).send( { accountUpdated } );
    } );
}