'use strict';

const Hapi = require('@hapi/hapi'); //importa o modulo hapi
const knexConfig = require('./knexfile'); // Importa as configurações do Knex
const knex = require('knex')(knexConfig.development); // Inicializa o Knex com o ambiente de desenvolvimento
const defaultImg = "https://coffee.alexflipnote.dev/9XplvHbtDys_coffee.jpg"

async function getImg(){
    const imgResponse = await fetch("https://coffee.alexflipnote.dev/random.json")

    if(imgResponse.ok){
        const img = await imgResponse.json()
        return img.file
    }
}

const init = async () => {
    const server = Hapi.server({
        port:8000,
        host:'localhost',
        routes: {
            cors: {
            origin: ['*'], // Permite qualquer origem
                headers: ['Accept', 'Content-Type'], // Cabeçalhos permitidos
                additionalHeaders: ['Authorization'], // Cabeçalhos adicionais, se necessário
            },
        },
    })
    server.route([
            {
                method:"GET",
                path:"/",
                handler:async(request, h)=>{
                    console.log("GET/")
                    console.log("Request recebido!")
                    try{
                        const cafe = await knex('estoque').select('*')
                        return h.response(cafe).code(200);

                    }
                    catch(error){
                        console.log(error)
                        return h.response({message:"Ocorreu um erro ao buscar os cafes", erro:error}).code(500);
                    }
                }
            },
            {
                method:'POST',
                path:"/createcofe",
                handler:async(request, h) => {
                    console.log("CREATE COFE POST")
                    console.log(request.payload)
                    let {nome_cafe, preco, marca, ano_vencimento, img} = request.payload;
                    console.log("Eu recebi o request")
                    console.log(img.length)
                    
                    if(img===undefined || img.length == 0){
                        console.log("Carregando uma imagem...")
                        img = await getImg()
                    }
                    
                    try{
                        const [id] = await knex('estoque').insert({
                            nome_cafe,
                            preco,
                            marca,
                            ano_vencimento,
                            img
                        }).returning('id')

                        return h.response({message:'cafe adicionado com sucesso'}).code(201);
                    }catch(error){
                        return h.response({message:'erro na criacao do cafe', erro: error}).code(500);

                    }
                }
            },
            
            {
                method:"GET",
                path:"/cafe/{id}",
                handler:async(request, h)=>{
                    console.log("GET POR ID")
                    const cafeId = request.params.id
                    console.log("ID DA URL:", cafeId)
                    try{
                        const result = await knex("estoque").where({id:cafeId}) //coluna ID, busque pelo cafeId
                        if (result.length !== 0){
                            return result
                        }
                        else{
                            return h.response({message:`O cafe com ID ${cafeId} não existe`}).code(404)
                        }
                    }
                    catch(error){
                        return h.response({message:`Ocorreu um erro ao tentar buscar o cafe: ${error}`}).code(500)
                    }
                }
            },
            {
                method:"PUT",
                path:"/cafe/{id}",
                handler:async(request, h)=>{
                    console.log("CAFE POR ID METODO PUT")
                    const cafeId = request.params.id
                    const {nome_cafe, preco, ano_vencimento, marca, img} = request.payload
                    console.log(request.payload)
                    try{
                        let result = await knex("estoque").where({id:cafeId}) //coluna ID, busque pelo cafeId
                        result = result[0]
                        console.log(result)
                        if (result.length !== 0){
                            const nome_novo = nome_cafe === undefined ? result.nome_cafe : nome_cafe
                            const preco_novo =  preco === undefined ? result.preco: preco
                            const ano_vencimento_novo = ano_vencimento === undefined ? result.ano_vencimento : ano_vencimento
                            const marca_nova = marca === undefined ? result.marca : marca
                            const img_nova = img === undefined ? defaultImg : img

                            await knex('estoque')
                            .where({id:cafeId})
                            .update({nome_cafe:nome_novo, preco:preco_novo, marca:marca_nova, ano_vencimento:ano_vencimento_novo})
                            return h.response({ message: `Café ${cafeId} foi atualizado com sucesso`,code:200 }).code(200); 
                        }
                    }
                    catch(erro){
                        return h.response({ message: `Erro ao tentar atualizar o cafe:${erro}` }).code(500); 
                    }
                }
            },

            {
                method:"DELETE",
                path:"/cafe/{id}",
                handler:async(request, h) => {
                    const cafeId = request.params.id
                    try{
                        let result = await knex('estoque').where({id:cafeId})
                        result = result[0]
                        console.log("Resultado:", result)

                        if (result===undefined){
                            return h.response({ error: 'Café não encontrado' }).code(404);
                        }

                        else{
                            await knex('estoque').where({ id: cafeId }).del();
                            console.log("Café excluído com sucesso"); 
                            return h.response({ message: `Café ${cafeId} excluído com sucesso` }).code(200);    
                        }
                    }
                    catch(error){
                        console.error(error);
                        return h.response({ error: 'Erro ao excluir o café' }).code(500);
                    }                    
                }
            }
        ]
    )

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err)=>{ 
    console.log(err);
    process.exit(1);
})

init();