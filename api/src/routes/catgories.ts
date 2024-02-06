import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";





export async function Categories( fastify: FastifyInstance )
{
    fastify.get( "/", async ( req, res ) =>
    {
        const { userId } = req.body as { userId: number }

        const categories = await prisma.categories.findMany( {
            where: {
                userId: userId || null
            }
        } );
        return res.status( 200 ).send( { categories } );
    } );

    fastify.post( "/", async ( req, res ) =>
    {
        const createCategories = z.object( {
            category: z.string(),
            parentId: z.number(),
            userId: z.number(),
        } )
        const category = createCategories.parse( req.body )
        const categoryCreated = await prisma.categories.create( {
            data: {
                category: category.category,
                parentId: category.parentId,
                userId: category.userId

            }
        } )
        return res.status( 201 ).send( { categoryCreated } );
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