import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

import { z } from "zod";
import { Routes } from "./routes";





async function bootstrap()
{
    const fastify: FastifyInstance = Fastify( { logger: true } );
    await fastify.register( cors, {
        origin: true,
    } );
    fastify.register( Routes );
    await fastify.listen( { port: 3333, host: "0.0.0.0" } );
}

bootstrap();
