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
    fastify.get( "/", async ( req, res ) =>
    {
        const { userId } = req.body as { userId: number }

        const accounts = await prisma.accounts.findMany( {
            where: {
                userId: userId
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
        const accountsCreated = await prisma.accounts.create( {
            data: {
                name: account.name,
                balance: account.balance,
                userId: account.userId

            }
        } )
        return res.status( 201 ).send( { accountsCreated } );
    } );
    fastify.put( "/:id", async ( req, res ) =>
    {
        const updateAccount = z.object( {
            name: z.string(),
            balance: z.number(),
            userId: z.number(),
        } )
        const { id } = req.params as { id: number }
        const account = updateAccount.parse( req.body )
        const accountUpdated = await prisma.accounts.update( {
            where: {
                id: id
            },
            data: {
                name: account.name,
                balance: account.balance,
            }
        } )
        return res.status( 202 ).send( { accountUpdated } );
    } );
}