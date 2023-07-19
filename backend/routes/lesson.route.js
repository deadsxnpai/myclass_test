const Router = require('express');
const router = new Router()
const lessonCotroller = require('../controllers/lesson.controller')

router.get('/', lessonCotroller.getLesson)
router.post('/lesson',lessonCotroller.createLesson)

module.exports = router