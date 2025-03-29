
import { Accounts } from "./accounts";
import { Categories } from "./catgories";
import { Transactions } from "./transactions";
import { Resume } from "./resume";
import { AccessControl } from "./accessControl";
import { FastifyTypedInstance } from "../fastify-config-instance";
import { UserController } from "../controllers/user-controller";



export async function Routes( fastify: FastifyTypedInstance )
{

    fastify.register( UserController, { prefix: '/users' } )
    fastify.register( AccessControl, { prefix: '/access-control' } )
    fastify.register( Accounts, { prefix: '/bank-accounts' } )
    fastify.register( Categories, { prefix: '/categories' } )
    fastify.register( Transactions, { prefix: '/transactions' } )
    fastify.register( Resume, { prefix: '/resume' } )
}