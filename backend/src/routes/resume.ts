import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import SumTransactionsByType from "../utils/TransactionsSum";
import { FastifyTypedInstance } from "../fastify-config-instance";
export async function Resume( fastify: FastifyTypedInstance )
{
    fastify.get( "", {

        schema: {
            tags: ["resume"],
        }

    }
        , async ( req, res ) =>
        {
            let { userId } = req.query as { userId: string }
            const currentDate = new Date();
            const month = currentDate.getMonth()
            const startDate = new Date( currentDate.getFullYear(), month, 1 )
            const finishDate = new Date( currentDate.getFullYear(), month + 1, 0 )

            const transactions = await prisma.transactions.findMany( {
                where: {

                    userId: parseInt( userId ),
                    OR: [
                        {
                            date: {
                                gte: startDate,
                                lte: finishDate
                            }
                        },
                        {
                            isRecurrence: true
                        }
                    ]



                },
                select: {
                    id: true,
                    description: true,
                    amount: true,
                    isConsolidated: true,
                    isRecurrence: true,
                    date: true,
                    installments: true,
                    current_installments: true,


                    Adjustments: {
                        select: {
                            id: true,
                            newAmount: true,
                            newDate: true,
                            isOnly: true
                        }
                    },
                    PaymentType: {
                        select: {
                            id: true,
                            type: true
                        }
                    },
                    TransactionsType: {
                        select: {
                            id: true,
                            type: true
                        }

                    },
                    Category: {
                        select: {
                            id: true,
                            category: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc',


                },
                skip: 0,
                take: 200



            } );

            const response = SumTransactionsByType( transactions, month )

            return res.status( 200 ).send( {
                TotalIncome: response.totalIncome,
                TotalExpenses: response.totalExpenses,
                Result: response.result
            } );
        } );
}