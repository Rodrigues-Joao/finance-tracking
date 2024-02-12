import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main()
{
    let paymentType = await prisma.paymentType.create( {
        data: {
            type: "Crédito"
        },
    }
    );
    paymentType = await prisma.paymentType.create( {
        data: {
            type: "Débito"
        },
    }
    );


    let transactionsType = await prisma.transactionsType.create( {
        data: {
            type: "À Vista"
        },
    }
    );
    transactionsType = await prisma.transactionsType.create( {
        data: {
            type: "Parcelado"
        },
    }
    );
    transactionsType = await prisma.transactionsType.create( {
        data: {
            type: "Recorrente"
        },
    }
    );

}

main();