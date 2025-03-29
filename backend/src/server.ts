import { fastify, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie, { FastifyCookieOptions } from '@fastify/cookie'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { Routes } from "./routes";


const PRIVATE_KEY = process.env.COOKIE_PRIVATE_TOKEN || "12345678"


async function bootstrap()
{
    const app = fastify();
    app.setValidatorCompiler( validatorCompiler );
    app.setSerializerCompiler( serializerCompiler );
    app.register( fastifySwagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Test swagger',
                description: 'Testing the Fastify swagger API',
                version: '0.1.0'
            },

            // servers: [
            //     {
            //         url: 'http://localhost:3333',
            //         description: 'Development server'
            //     }
            // ],
            // tags: [
            //     { name: 'user', description: 'User related end-points' },
            //     { name: 'code', description: 'Code related end-points' }
            // ],
            // components: {
            //     securitySchemes: {
            //         apiKey: {
            //             type: 'apiKey',
            //             name: 'apiKey',
            //             in: 'header'
            //         }
            //     }
            // },
            // externalDocs: {
            //     url: 'https://swagger.io',
            //     description: 'Find more info here'
            // }
        },
        transform: jsonSchemaTransform,
    } )


    await app.register( fastifySwaggerUI, {
        routePrefix: '/docs',
    } )
    await app.register( cors, {
        origin: true,
    } );
    app.register( cookie, {
        secret: PRIVATE_KEY, // for cookies signature
        parseOptions: {}     // options for parsing cookies
    } as FastifyCookieOptions )
    app.register( Routes );
    await app.ready()
    await app.listen( { port: 3333, host: "0.0.0.0" } );
}

bootstrap();
