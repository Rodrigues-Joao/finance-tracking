import { FastifyInstance } from "fastify";
import { Users } from "./users";
import { Accounts } from "./accounts";
import { Categories } from "./catgories";
import { Transactions } from "./transactions";
import { Resume } from "./resume";
import { AccessControl } from "./accessControl";
import { FastifyTypedInstance } from "../fastify-config-instance";



export async function Routes( fastify: FastifyTypedInstance )
{

    fastify.register( Users, { prefix: '/users' } )
    fastify.register( AccessControl, { prefix: '/access-control' } )
    fastify.register( Accounts, { prefix: '/bank-accounts' } )
    fastify.register( Categories, { prefix: '/categories' } )
    fastify.register( Transactions, { prefix: '/transactions' } )
    fastify.register( Resume, { prefix: '/resume' } )
}