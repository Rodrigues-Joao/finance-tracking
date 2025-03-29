import { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import * as bcrypt from "bcrypt"
import { sign } from 'jsonwebtoken'
const PRIVATE_KEY = process.env.PRIVATE_TOKEN || "12345678"
export const userLoginSchema = z.object( {
    email: z.string().email( { message: "informe um email válido" } ),
    password: z.string().min( 1, { message: "Preencha sua senha" } )
} )
const sessionExpiresIn = 1000 * 60 * 60 * 24;

export type UserLoginSchema = z.infer<typeof userLoginSchema>
export async function AccessControl( fastify: FastifyInstance )
{

    fastify.post( "/login", async ( req, res ) =>
    {
        let userBody: UserLoginSchema;
        try
        {
            userBody = userLoginSchema.parse( req.body )
        } catch ( error: any )
        {
            return res.status( 500 ).send( error )
        }
        let user;
        try
        {

            user = await prisma.user.findFirstOrThrow( {

                where: {
                    email: userBody.email,
                }
            } );
        }
        catch 
        {
            return res.status( 404 ).send( { message: "Usuário e/ou senha incorretos" } )
        }
        const passwordChecked = await bcrypt.compare( userBody.password, user.password )
        if ( !passwordChecked )
            return res.status( 404 ).send( { message: "Usuário e/ou senha incorretos" } )
        const token = sign( {}, PRIVATE_KEY, { expiresIn: sessionExpiresIn } )
        res.setCookie( "accessToken", token, { path: "/api", httpOnly: true, maxAge: sessionExpiresIn } ).status( 200 ).send( {
            userId: user.id,
            name: user.name,
            email: user.email
        } )
    } )
    fastify.post( "/logout", async ( req, res ) =>
    {
        const createUserBody = z.object( { email: z.string().email() } )
        const userBody = createUserBody.parse( req.body )
        const user = await prisma.user.findFirst( {

            where: {

                email: userBody.email,
            }


        } );
        return res.status( 200 ).send( { user } )
    } )

}