import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { FastifyTypedInstance } from "../fastify-config-instance";

type ResponseCategoriesType = [{
    id: number;
    isParent?: boolean;
    category: string;
    categoryTypeId: number;
    subCategory: ResponseCategoriesType

}]
function convertSub( data: any[] )
{
    return data.map( element => (
        {
            id: element.id,
            category: element.category,
            categoryTypeId: element.categoryTypeId,

        } ) ) as ResponseCategoriesType
}
function convertCategories( data: any[] ): ResponseCategoriesType
{

    return data.map( ( category ) => ( {
        id: category.id,
        isParent: category.parentId !== null,
        category: category.category,
        categoryTypeId: category.categoryTypeId,
        subCategory: convertSub( category.subCategories )
    } ) ) as ResponseCategoriesType;



}


export async function Categories( fastify: FastifyTypedInstance )
{
    fastify.get( "/", {

        schema: {
            tags: ["categories"],
        }

    }
        , async ( req, res ) =>
        {
            const { userId } = req.query as { userId: string }
            const cluseCategoryByUser = [
                {
                    userId: parseInt( userId )
                },
                {
                    userId: null
                }
            ]
            const categories = await prisma.categories.findMany( {
                where: {
                    OR: cluseCategoryByUser,
                    AND: {
                        parentId: null
                    }
                },
                select: {
                    id: true,
                    category: true,
                    categoryTypeId: true,
                    subCategories: {
                        where: {
                            OR: cluseCategoryByUser
                        },
                        select: {

                            id: true,
                            category: true,
                            categoryTypeId: true
                        }
                    }
                }
            } );

            const categoriesRes: ResponseCategoriesType = convertCategories( categories )

            return res.status( 200 ).send( { categories: categoriesRes } );
        } );

    fastify.post( "/", {

        schema: {
            tags: ["categories"],
        }

    }, async ( req, res ) =>
    {
        const createCategory = z.object( {
            category: z.string(),
            parentId: z.number().optional(),
            userId: z.number().optional(),
            categoryTypeId: z.number()
        } )
        const category = createCategory.parse( req.body )
        const categoryCreated = await prisma.categories.create( {
            data: {
                category: category.category,
                parentId: category.parentId,
                userId: category.userId,
                categoryTypeId: category.categoryTypeId

            }
        } )
        return res.status( 201 ).send( { message: "Categoria criada com sucesso!" } );
    } );
    fastify.put( "/:id", {

        schema: {
            tags: ["categories"],
        }

    }, async ( req, res ) =>
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
    fastify.delete( "/:id", {

        schema: {
            tags: ["categories"],
        }

    }, async ( req, res ) =>
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
