import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";

import { z } from "zod";
import { Routes } from "./routes";





async function bootstrap()
{
    const fastify: FastifyInstance = Fastify( { logger: true } );
    await fastify.register( require( '@fastify/swagger' ) )

    await fastify.register( require( '@fastify/swagger-ui' ), {
        routePrefix: "/documentation",
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Test swagger',
                description: 'Testing the Fastify swagger API',
                version: '0.1.0'
            },
            servers: [
                {
                    url: 'http://localhost:3333',
                    description: 'Development server'
                }
            ],
            tags: [
                { name: 'user', description: 'User related end-points' },
                { name: 'code', description: 'Code related end-points' }
            ],
            components: {
                securitySchemes: {
                    apiKey: {
                        type: 'apiKey',
                        name: 'apiKey',
                        in: 'header'
                    }
                }
            },
            externalDocs: {
                url: 'https://swagger.io',
                description: 'Find more info here'
            }
        }
    } )
    await fastify.register( cors, {
        origin: true,
    } );
    fastify.register( Routes );
    await fastify.ready()
    await fastify.listen( { port: 3333, host: "0.0.0.0" } );
}

bootstrap();
