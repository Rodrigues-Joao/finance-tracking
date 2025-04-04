import { FastifyInstance } from "fastify";


import { date, z } from "zod";
import { prisma } from "../lib/prisma";
import SumTransactionsByType from "../utils/TransactionsSum";
import { FastifyTypedInstance } from "../fastify-config-instance";


type Account = {
    name: string;
    balance: number;
    userId: number;

}


type TransactionsFoundType = {
    id: number;
    description: string;
    amount: number;
    isConsolidated?: boolean | null;
    isRecurrence: boolean;
    date: string;
    installments: number;
    current_installments: number;
    Adjustments?: AdjustmentType;
    PaymentType: PaymentType;
    TransactionsType: TransactionsType;
    Category?: CategoryType;
}
type CategoryType = {
    id: number;
    category: string;
}
type PaymentType = {
    id: number, type: string
}
type TransactionsType = {
    id: number, type: string
}

type AdjustmentType = [{
    id: number;
    newAmount: number;
    newDate: string;
    isOnly: boolean;
}]
export async function Transactions( fastify: FastifyTypedInstance )
{
    fastify.get( "", {

        schema: {
            tags: ["transactions"],
            querystring: z.object( {
                userId: z.string(),
                currentMonth: z.string()
            } ),
            response: {
                200: z.object( {
                    TotalIncome: z.number(),
                    TotalExpenses: z.number(),
                    transactions: z.array( z.object( {
                        id: z.number(),
                        description: z.string(),
                        amount: z.number(),
                        isConsolidated: z.boolean().nullable(),
                        isRecurrence: z.boolean(),
                        date: date(),
                        installments: z.number(),
                        current_installments: z.number(),

                        Adjustments: z.array( z.object( {
                            id: z.number(),
                            newAmount: z.number(),
                            newDate: date(),
                            isOnly: z.boolean()
                        } ) ).optional(),

                        PaymentType: z.object( {
                            id: z.number(),
                            type: z.string()
                        } ),
                        TransactionsType: z.object( {
                            id: z.number(),
                            type: z.string()
                        } ),
                        Category: z.object( {
                            id: z.number(),
                            category: z.string()
                        } ).nullable()

                    } ) )
                } )
            }
        }

    }, async ( req, res ) =>
    {

        let { userId, currentMonth } = req.query as { userId: string, currentMonth: string }
        const month = parseInt( currentMonth );
        const currentDate = new Date();
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
            transactions: transactions
        } );
    } );
    fastify.get( "/:id", {

        schema: {
            tags: ["transactions"],
            params: z.object( {
                id: z.coerce.number()
            } ),
        }

    }, async ( req, res ) =>
    {
        const { id } = req.params
        const transaction = await prisma.transactions.findUnique( {
            where: {
                id
            }
        } );
        return res.status( 200 ).send( { ...transaction } );
    } );
    fastify.post( "/", {

        schema: {
            tags: ["transactions"],
        }

    }, async ( req, res ) =>
    {

        const createTransactio = z.object( {
            description: z.string(),
            amount: z.number().min( 0.01 ),
            installments: z.number().default( 1 ),
            isRecurrence: z.boolean().default( false ),
            paymentTypeId: z.number().optional().default( 1 ),
            transactionsTypeId: z.number(),
            accountsId: z.number(),
            userId: z.number(),
            categoryId: z.number(),
            date: z.string().datetime()


        } )


        const transaction = createTransactio.parse( req.body )

        let date = new Date( transaction.date );
        let amount = parseFloat( ( transaction.amount / transaction.installments ).toFixed( 2 ) );
        let dates = calculateInstallmentsDates( date, transaction.installments )
        let account = await prisma.accounts.findFirst( {
            where: { id: transaction.accountsId }
        } )
        if ( !account )
            return res.status( 404 ).send( { error: "account not found" } );

        await prisma.accounts.update( { where: { id: account.id }, data: { balance: { decrement: amount } } } )
        try
        {
            for ( let i = 1; i <= transaction.installments; i++ )
            {
                await prisma.transactions.create( {
                    data: {
                        description: transaction.description,
                        amount: amount,
                        installments: transaction.installments,
                        current_installments: i,
                        isRecurrence: transaction.isRecurrence,
                        userId: transaction.userId,
                        paymentTypeId: transaction.paymentTypeId,
                        accountsId: transaction.accountsId,
                        transactionsTypeId: transaction.transactionsTypeId,
                        date: dates[i - 1],
                        isConsolidated: i == 1 ? true : false,
                        categoryId: transaction.categoryId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                } )
            }
        } catch ( error )
        {
            return res.status( 500 ).send( { message: error } );
        }
        return res.status( 201 ).send( { message: "created" } );
    } );
    fastify.put( "/:id", {

        schema: {
            tags: ["transactions"],
        }

    }, async ( req, res ) =>
    {
        const updateTransaction = z.object( {
            description: z.string(),
            lastAmount: z.number(),
            amount: z.number(),
            paymentTypeId: z.number(),
            categoryId: z.number(),
            isRecurrence: z.boolean(),
            newDate: z.string().datetime(),
            transactionDate: z.string().datetime(),
            updateOnly: z.boolean()
        } )
        const { id } = req.params as { id: string }
        const transaction = updateTransaction.parse( req.body )
        const currentDate = new Date( transaction.newDate )
        const transactionDate = new Date( transaction.transactionDate )
        if ( transaction.isRecurrence )
            await prisma.adjustments.create( {
                data: {
                    newAmount: transaction.amount,
                    newDate: new Date( currentDate.getFullYear(), currentDate.getMonth(), transactionDate.getDate() ),
                    isOnly: transaction.updateOnly,
                    transactionId: parseInt( id )

                }
            } )

        const transactionUpdated = await prisma.transactions.update( {
            where: {
                id: parseInt( id )
            },

            data: {

                description: transaction.description,
                amount: transaction.isRecurrence ? transaction.lastAmount : transaction.amount,
                paymentTypeId: transaction.paymentTypeId,
                categoryId: transaction.categoryId,
                updatedAt: new Date(),
            }

        } )
        return res.status( 202 ).send( { transactionUpdated } );
    } );
}
function calculateInstallmentsDates( transictionDate: Date, installments: number )
{
    let intallmentDates = [new Date( transictionDate )]; // Adiciona a data de compra como a primeira parcela
    let month = transictionDate.getMonth();
    let day = transictionDate.getDate();
    let year = transictionDate.getFullYear();
    for ( let i = 1; i < installments; i++ )
    {
        month++;
        if ( month > 11 )
        {
            year++;
            month = 0
        }
        const isAnoBissexto = ( year % 4 === 0 && year % 100 !== 0 ) || year % 400 === 0;
        if ( month === 1 && isAnoBissexto && day > 29 )
        {
            day = 29;
        } else if ( month === 1 && day > 28 )
        {
            day = 28;
        }
        intallmentDates.push( new Date( year, month, day ) );
        day = transictionDate.getDate();
    }
    return intallmentDates;
}
