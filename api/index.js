import express from 'express'

const app = express()
const port = 4000
//import das rotas da aplicação
import rotasFilmes from './routes/filme.js'

app.use(express.json()) // irá fazer o parse de arquivos JSON
//Rotas de conteúdo público
app.use('/', express.static('public'))

//Configura o favicon
app.use('/favicom.ico', express.static('public/images/icon.videogame.png'))

//Rotas da API
app.use('/api/fimes', rotasFilmes)

app.get('api', (req, res) => {
    res.status(200).json({
        message: 'API Fatec 100% funcional',
        version: '1.0.1'
    })
})
//Rotas de exceção - deve ser a última
app.use(function (req, res) {
    res.status(404).json({
        errors: [{
            value: `${req.originalUrl}`,
            msg: `A rota ${req.originalUrl} não existe nesta API!`,
            param: 'invalid route'
}]
    })
})
app.listen(port, function(){
    console.log(` Servidor rodando na porta ${port}`)
})
