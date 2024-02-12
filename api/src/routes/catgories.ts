import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";





export async function Categories( fastify: FastifyInstance )
{
    fastify.get( "/", async ( req, res ) =>
    {
        const { userId } = req.query as { userId: string }

        const categories = await prisma.categories.findMany( {
            where: {
                OR: [{
                    userId: parseInt( userId )
                },
                {
                    userId: null,
                }
                ],
                AND: {
                    parentId: null
                }
            },
            include: {
                subCategories: true
            }
        } );
        return res.status( 200 ).send( { categories } );
    } );

    fastify.post( "/", async ( req, res ) =>
    {
        const createCategory = z.object( {
            category: z.string(),
            parentId: z.number().optional(),
            userId: z.number().optional()
        } )
        const category = createCategory.parse( req.body )
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
        const updateCategory = z.object( {
            category: z.string(),
            userId: z.number()

        } )
        const { id } = req.params as { id: string }

        const category = updateCategory.parse( req.body )
        const categoryUpdated = await prisma.categories.updateMany( {
            where: {
                AND: [{
                    userId: category.userId
                },
                {
                    userId: {
                        not: null,

                    },
                },
                {
                    id: parseInt( id )
                }
                ],

            },

            data: {
                category: category.category,
            }
        } )

        if ( categoryUpdated.count === 0 )
            return res.status( 403 ).send( { message: "Categoria não atualizada" } );

        return res.status( 202 ).send( { categoryUpdated } );
    } );
    fastify.delete( "/:id", async ( req, res ) =>
    {
        const updateCategory = z.object( {
            userId: z.number()
        } )
        const { id } = req.params as { id: string }

        const category = updateCategory.parse( req.body )
        const categoryDeleted = await prisma.categories.deleteMany( {
            where: {
                AND: [{
                    userId: category.userId
                },
                {
                    userId: {
                        not: null,

                    },
                },
                {
                    id: parseInt( id )
                }
                ],

            }
        } )

        if ( categoryDeleted.count === 0 )
            return res.status( 403 ).send( { message: "Categoria não excluida" } );
        return res.status( 200 ).send( { categoryDeleted } );
    } );
}
