import { FastifyInstance } from "fastify";


import { date, z } from "zod";
import { prisma } from "../lib/prisma";


type Account = {
    name: string;
    balance: number;
    userId: number;

}



export async function Transactions( fastify: FastifyInstance )
{
    fastify.get( "", async ( req, res ) =>
    {
        const { userId } = req.query as { userId: string }
        const transactions = await prisma.transactions.findMany( {
            where: {

                userId: parseInt( userId )
            }
        } );

        return res.status( 200 ).send( { transactions } );
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

        const createTransactio = z.object( {
            description: z.string(),
            amount: z.number(),
            installments: z.number().default( 1 ),
            isRecurrence: z.boolean(),
            paymentTypeId: z.number(),
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
        try
        {

            for ( let i = 1; i <= transaction.installments; i++ )
            {

                const created = await prisma.transactions.create( {
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
    // fastify.put( "/:id", async ( req, res ) =>
    // {
    //     const createTransactio = z.object( {
    //         description: z.string(),
    //         amount: z.number(),
    //         accountsId: z.number(),
    //         userId: z.number(),
    //         categoryId: z.number(),
    //         date: z.string().datetime()


    //     } )

    //     const { id } = req.params as { id: string }
    //     const transaction = createTransactio.parse( req.body )
    //     const transactionUpdated = await prisma.transactions.update( {
    //         where: {
    //             id: parseInt( id )
    //         },

    //         data: {
    //             description: transaction.description,
    //             amount: transaction.amount,
    //             installments: transaction.installments,
    //             current_installments: transaction.current_installments,
    //             isRecurrence: transaction.isRecurrence,
    //             userId: transaction.userId,
    //             paymentTypeId: transaction.paymentTypeId,
    //             accountsId: transaction.accountsId,
    //             transactionsTypeId: transaction.transactionsTypeId,
    //             date: transaction.date,
    //             categoryId: transaction.categoryId,
    //             createdAt: new Date(),
    //             updatedAt: new Date(),
    //         }

    //     } )
    //   return res.status( 202 ).send( { accountUpdated } );
    //} );
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
