import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main()
{

    let categoryTypeGanhos = await prisma.categoryType.create( {
        data: {
            type: "Ganhos"
        }
    } )
    let categoryTypeGastos = await prisma.categoryType.create( {
        data: {
            type: "Gastos"
        }
    } )

    let category = await prisma.categories.create( {
        data: {
            category: "Alimentação",
            categoryTypeId: categoryTypeGastos.id
        }
    } )
    category = await prisma.categories.create( {
        data: {
            category: "Supermercado",
            parentId: category.id,
            categoryTypeId: categoryTypeGastos.id
        }
    } )
    category = await prisma.categories.create( {
        data: {
            category: "Salário",
            categoryTypeId: categoryTypeGanhos.id
        }
    } )


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
    )
    let transactionsType = await prisma.transactionsType.create( {
        data: {
            type: "Gasto"
        },
    }
    );
    transactionsType = await prisma.transactionsType.create( {
        data: {
            type: "Ganho"
        },
    }
    );
    transactionsType = await prisma.transactionsType.create( {
        data: {
            type: "Transfência"
        },
    }
    );

}

main();