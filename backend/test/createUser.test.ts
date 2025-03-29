import axios from "axios"
axios.defaults.validateStatus = function ()
{
    return true;
}

test( "Deve criar um usuário", async () =>
{
    const user = {
        name: "joao",
        email: `joao${ Math.random() }@example.com`,
        password: "Gw1#98dsh"
    }
    const respose = ( await axios.post( 'http://localhost:3333/users', user ) ).data
    expect( respose.name ).toBe( user.name )
    expect( respose.email ).toBe( user.email )

} )

test( "Não deve criar um usuário com email enválido", async () =>
{
    const user = {
        name: "joao",
        email: `joao${ Math.random() }`,
        password: "Gw1#98dsh"
    }
    const res = await axios.post( 'http://localhost:3333/users', user )
    expect( res.status ).toBe( 400 )
    expect( res.data.message ).toEqual( "Invalid email" )
} )
test( "Não deve criar um usuário com senha sem ao menos um caracter especial", async () =>
{
    const user = {
        name: "joao",
        email: `joao${ Math.random() }@gmail.com`,
        password: "Gw198dsh"
    }
    const res = await axios.post( 'http://localhost:3333/users', user )
    expect( res.status ).toBe( 400 )
    expect( res.data.message ).toEqual( "Password must contain at least one special character" )
} )
test( "Não deve criar um usuário com senha sem ao menos um número", async () =>
{
    const user = {
        name: "joao",
        email: `joao${ Math.random() }@gmail.com`,
        password: "Gw@fjffdsh"
    }
    const res = await axios.post( 'http://localhost:3333/users', user )
    expect( res.status ).toBe( 400 )
    expect( res.data.message ).toEqual( "Password must contain at least one number" )
} )
test( "Não deve criar um usuário com senha sem ao menos uma letra maiuscula", async () =>
{
    const user = {
        name: "joao",
        email: `joao${ Math.random() }@gmail.com`,
        password: "sw@fjffdsh"
    }
    const res = await axios.post( 'http://localhost:3333/users', user )
    expect( res.status ).toBe( 400 )
    expect( res.data.message ).toEqual( "Password must contain at least one uppercase letter" )
} )
test( "Não deve criar um usuário com senha sem ao menos uma letra minuscula", async () =>
{
    const user = {
        name: "joao",
        email: `joao${ Math.random() }@gmail.com`,
        password: "#GDJEU76876"
    }
    const res = await axios.post( 'http://localhost:3333/users', user )
    expect( res.status ).toBe( 400 )
    expect( res.data.message ).toEqual( "Password must contain at least one lowercase letter" )
} )
test( "Não deve criar um usuário com senha com menos de 8 caracteres", async () =>
{
    const user = {
        name: "joao",
        email: `joao${ Math.random() }@gmail.com`,
        password: "#GD76"
    }
    const res = await axios.post( 'http://localhost:3333/users', user )
    expect( res.status ).toBe( 400 )
    expect( res.data.message ).toEqual( "Password must be at least 8 characters" )
} )