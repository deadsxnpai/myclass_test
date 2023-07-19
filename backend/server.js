const express = require('express');
const bodyParser = require('body-parser');
const lessonRouter = require('./routes/lesson.route')
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/', lessonRouter)

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});