
export default function SumTransactionsByType( data: any[], currentMonth: number ): { totalIncome: number, totalExpenses: number, result: number }
{
    let sumIncome = 0;
    let sumExpenses = 0;

    data.map( transaction =>
    {
        switch ( transaction.TransactionsType.id )
        {

            case 1:

                if ( transaction.Adjustments.length === 0 )
                {
                    sumExpenses += transaction.amount;
                    break;
                }
                transaction.Adjustments.forEach( ( adjusments: any ) =>
                {
                    const month = new Date( adjusments.newDate ).getMonth()

                    if ( currentMonth === month )
                    {
                        transaction.amount = adjusments.newAmount
                        return sumExpenses += adjusments.newAmount

                    }
                } )
                break;
            case 2:
                sumIncome += transaction.amount;
                break;
        }

    } )

    return { totalIncome: sumIncome, totalExpenses: sumExpenses, result: sumIncome - sumExpenses }
}