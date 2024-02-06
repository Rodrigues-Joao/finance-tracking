import { FastifyInstance } from "fastify";
import { Users } from "./users";



export async function Routes( fastify: FastifyInstance )
{

    fastify.register( Users, { prefix: '/users' } )
}