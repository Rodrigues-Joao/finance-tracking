import { fastify, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie, { FastifyCookieOptions } from '@fastify/cookie'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { Routes } from "./routes";
import { ZodError } from "zod";


const PRIVATE_KEY = process.env.COOKIE_PRIVATE_TOKEN || "12345678"


async function bootstrap()
{
    const app = fastify();
    app.setErrorHandler( ( error, request, reply ) =>
    {
        if ( !error.validation )
            return reply
        const symbols = Object.getOwnPropertySymbols( error?.validation[0] );
        if ( !symbols )
            return reply
        if ( symbols[0].description !== 'ZodFastifySchemaValidationError' )
            return reply

        return reply.status( error.statusCode ?? 500 ).send( { message: error.validation[0].message } )


    } )

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
