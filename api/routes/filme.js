/* API REST dos filmes */

import express, { Router } from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'
//JWT
import auth from '../middleware/auth.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'filmes'

const validaFilme = [
    check('title')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome do filme')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .isLength({min:1}).withMessage('O nome do filme deve ter pelo menos um caractere')
    .isLength({max:200}).withMessage('O nome do filme é muito longo. Máximo 200'),
    check('year')
    .not().isEmpty().trim().withMessage('É obrigatório informar o ano')
    .isNumeric().withMessage('O ano deve conter números')
    .isLength({ min: 4, max: 4 }).withMessage('O ano deve conter 4 números'),
    check('imdb_id')
    .not().isEmpty().trim().withMessage('É obrigatório informar o IMDB id do filme')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .custom(value => {
        if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value)) {
            throw new Error('O IMDb deve conter pelo menos uma letra e um número.');
        }
        return true;
    })
    .isLength({min:7, max:7}).withMessage('O imdb deve conter 7 caracteres'),
    check('rank')
    .not().isEmpty().trim().withMessage('É obrigatório informar o rank do filme')
    .isNumeric().withMessage('O rank deve conter apenas números')
    .isLength({ min: 1, max: 6 }).withMessage('O rank pode conter até 6 caracteres'),
    check('actors')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome dos atores')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .isLength({min:1}).withMessage('O filme deve conter pelo menos um nome')
    .isLength({max:10000}).withMessage('Já há muitos nomes. máximo 10000 caracteres'),
    check('aka').optional({nullable: true}),
    check('director')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome do diretor do filme')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .isLength({min:1}).withMessage('O filme deve conter pelo menos um diretor')
    .isLength({max:10000}).withMessage('No máximo 1000 caracteres')
] 

/**
 * GET /api/filmess
 * Lista todos os filmes
 */
router.get('/',async(req,res) => {
    try{
        db.collection(nomeCollection).find().sort({title: 1}).toArray((err,docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg:`Erro ao obter a listagem dos prestadores`,
                param: '/'
            }]
        })
    }
})

/**
 * GET /api/filmes/id/:id
 * Lista todos os filmes
 */
router.get('/id/:id', async(req, res) => {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.params.id)}}).toArray((err, docs) => {
            if(err){
                res.status(400).json(err)
            } else {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * GET /api/filmes/title/:title
 * Lista todos os filmes pelo titulo
 */
router.get('/title/:title', async(req, res) => {
    try{
        db.collection(nomeCollection)
        .find({'title': {$regex: req.params.title, $options: "i"}})
        .ToArray((err, docs) => {
            if(err){
                res.status(400).json(err)
            } else {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * DELETE /api/filmes/:id
 * Apaga o filmes pelo id
 */

router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": { $eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})

/**
 * POST /api/filmes
 * Insere um novo filme
 */
router.post('/', validaFilme, async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/**
 * PUT /api/filmes
 * Altera um filme
 */
router.put('/', validaFilme, async(req, res) => {
    let idDocumento = req.body._id //Armazena o id do documento
    delete req.body._id //iremons remover o id do body

    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq : ObjectId(idDocumento)}}, { $set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/**************************
 * POST filmes/cadastro
 * Efetua o cadastro de um filme e retorna o token JWT
 */

const validaCadastro = [
    check('title')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome do filme')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .isLength({min:1}).withMessage('O nome do filme deve ter pelo menos um caractere')
    .isLength({max:200}).withMessage('O nome do filme é muito longo. Máximo 200'),
    check('year')
    .not().isEmpty().trim().withMessage('É obrigatório informar o ano')
    .isNumeric().withMessage('O ano deve conter números')
    .isLength({ min: 4, max: 4 }).withMessage('O ano deve conter 4 números')
    ]

    router.post('/cadastro', validaCadastro, async (req, res) => {
        const schemaErrors = validationResult(req)
        if (!schemaErrors.isEmpty()) {
            return res.status(403).json(({ errors: schemaErrors.array() }))
        }
        //obtendo os valores para o cadastro
        const { title, year } = req.body;
        try {
            //Verificando se o nome do filme informado existe no Mongodb
            let filme = await db.collection(nomeCollection)
                .find({ title }).limit(1).toArray()
            //Se o array estiver vazio, é que o filme não existe
            if (!filme.length)
                return res.status(404).json({
                    errors: [{
                        value: `${title}`,
                        msg: 'O filme informado não está cadastrado',
                        param: 'title'
                    }]
                })
            //Se o filme existir, comparamos se a ano está correta  
            const isMatch = await bcrypt.compare(year, filme[0].year)
            if (!isMatch)
                return res.status(403).json({
                    errors: [{
                        value: `year`,
                        msg: 'O ano informada está incorreta',
                        param: 'year'
                    }]
                })
            //Iremos gerar o token JWT
            jwt.sign(
                { filme: { id: filme[0]._id } },
                process.env.SECRET_KEY,
                { expiresIn: process.env.EXPIRES_IN },
                (err, token) => {
                    if (err) throw err
                    res.status(200).json({
                        access_token: token
                    })
                }
            )
        } catch (e) {
            console.error(e)
        }
    })

/************************************************************
 * GET /filmes
 * Lista todos os filmes. Necessita do token
 ************************************************************/
router.get('/', auth, async(req, res)=> {
    try{
        db.collection(nomeCollection)
        .find({},{projection: { year: false}})
        .sort({title:1})
        .toArray((err, docs)=> {
            if(!err){ res.status(200).json(docs)}
        })
    } catch (err){
        res.status(500).json({errors: 
            [{msg: 'Erro ao obter a listagem de filmes'}]})
    }
})

/************************************************************
 * DELETE /filmes/id
 * Remove o usuário pelo id. Necessita do token
 ************************************************************/
router.delete('/:id', auth, async(req, res)=> {
    await db.collection(nomeCollection)
    .deleteOne({'_id': {$eq: ObjectId(req.params.id)}})
    .then(result => res.status(202).send(result)) //accepted
    .catch(err => res.status(400).json(err)) //bad request
})

/************************************************************
 * PUT /filmes/id
 * Altera os dados do filme pelo id. Necessita do token
 ************************************************************/
router.put('/:id', auth, validaFilme, async(req, res) => {
    const schemaErrors = validationResult(req)
    if(!schemaErrors.isEmpty()){
        return res.status(403).json({
            errors: schemaErrors.array()
        })
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq: ObjectId(req.params.id)}},
        { $set: req.body }
        )
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
    }
})

export default router