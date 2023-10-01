/* API REST dos filmes */

import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'filmes'

const validaFilmes = [
    check('#TITLE')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome do filme')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .isLength({min:1}).withMessage('O nome do filme deve ter pelo menos um caractere')
    .isLength({max:200}).withMessage('O nome do filme é muito longo. Máximo 200'),
    check('YEAR')
    .not().isEmpty().trim().withMessage('É obrigatório informar o ano')
    .isNumeric().withMessage('O ano deve conter números')
    .isLength({ min: 4, max: 4 }).withMessage('O ano deve conter 4 números'),
    check('#IMDB_ID')
    .not().isEmpty().trim().withMessage('É obrigatório informar o IMDB id do filme')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .custom(value => {
        if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value)) {
            throw new Error('O IMDb deve conter pelo menos uma letra e um número.');
        }
        return true;
    })
    .isLength({min:7, max:7}).withMessage('O imdb deve conter 7 caracteres'),
    check('RANK')
    .not().isEmpty().trim().withMessage('É obrigatório informar o rank do filme')
    .isNumeric().withMessage('O rank deve conter apenas números')
    .isLength({ min: 1, max: 6 }).withMessage('O rank pode conter até 6 caracteres'),
    check('#ACTORS')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome dos atores')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .isLength({min:1}).withMessage('O filme deve conter pelo menos um nome')
    .isLength({max:10000}).withMessage('Já há muitos nomes. máximo 10000 caracteres'),
    check('#AKA').optional({nullable: true})
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
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.parems.id)}})
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
 * GET /api/filmes/title/:title
 * Lista todos os filmes pelo titulo
 */
router.get('/title/:title', async(req, res) => {
    try{
        db.collection(nomeCollection)
        .find({'#TITLE': {$regex: req.params.title, $options: "i"}})
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
router.post('/', validaFilmes, async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .insrtOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/**
 * PUT /api/filmes
 * Altera um filme
 */
router.put('/', validaFilmes, async(req, res) => {
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

export default router