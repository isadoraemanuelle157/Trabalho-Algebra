const express = require('express')
const router = express.Router()
const controller = require('../controllers/rankingController')

// salvar score
router.post('/', controller.create)

// listar ranking
router.get('/', controller.getAll)

// limpar ranking (admin)
router.delete('/', controller.clear)

router.get('/check-name', controller.checkName)


module.exports = router