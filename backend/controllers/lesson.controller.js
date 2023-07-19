const pool = require('../db')
const knex = require('knex')({
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: '1111',
      database: 'postgres',
    },
  });
const MAX_LESSONS = 300;
const MAX_DAYS = 365;

class LessonCotroller {
    
    // Задача 1.
    async getLesson(req, res){
        const { date, status, teacherIds, studentsCount, page, lessonsPerPage } = req.query;

        try {
            // Проверка и парсинг вх. параметров
            const pageNumber = parseInt(page) || 1;
            const lessonsPerPageNumber = parseInt(lessonsPerPage) || 5;

        // Создание where запроса
            let whereClause = '';
            const values = [];
    
            if (date) {
                const dates = date.split(',');
                if (dates.length === 1) {
                whereClause += 'date = ?';
                values.push(dates[0]);
            } else if (dates.length === 2) {
                whereClause += 'date BETWEEN ? AND ?';
                values.push(dates[0], dates[1]);
            } else {
                throw new Error('Invalid date parameter');
            }
            }

            if (status !== undefined && (status === '0' || status === '1')) {
                if (whereClause) whereClause += ' AND ';
                    whereClause += 'status = ?';
                    values.push(parseInt(status));
            }
            if (status !== undefined && !(status === '0' || status === '1')){
                throw new Error('Invalid status parameter');
            }

            if (teacherIds) {
                const teacherIdsArr = teacherIds.split(',')
            if (teacherIdsArr.length == 1) {
                    if (whereClause) whereClause += ' AND ';
                    whereClause += 'id IN (SELECT DISTINCT lesson_id FROM lesson_teachers WHERE teacher_id IN (?))';
                        values.push(parseInt(teacherIdsArr[0]));
            } else if (teacherIdsArr.length === 2){
                if (whereClause) whereClause += ' AND ';
                    whereClause += 'id IN (SELECT DISTINCT lesson_id FROM lesson_teachers WHERE teacher_id IN (?, ?))';
                        values.push(parseInt(teacherIdsArr[0]),parseInt(teacherIdsArr[1]));
                }
            }
    
            if (studentsCount) {
                const studentsCountArr = studentsCount.split(',');
            if (studentsCountArr.length === 1) {
                if (whereClause) whereClause += ' AND ';
                    whereClause += 'id IN (SELECT DISTINCT lesson_id FROM lesson_students GROUP BY lesson_id HAVING COUNT(*) = ?)';
                    values.push(parseInt(studentsCountArr[0]));
            } else if (studentsCountArr.length === 2) {
                if (whereClause) whereClause += ' AND ';
                    whereClause += 'id IN (SELECT DISTINCT lesson_id FROM lesson_students GROUP BY lesson_id HAVING COUNT(*) BETWEEN ? AND ?)';
                    values.push(parseInt(studentsCountArr[0]), parseInt(studentsCountArr[1]));
            } else {
                throw new Error('Invalid studentsCount parameter');
            }
            }

             // Подсчет общего количества уроков на основе фильтров
            const countQuery = knex('lessons').whereRaw(whereClause, values).countDistinct('id as totalCount');
            const [{ totalCount }] = await countQuery;

            // Получение уроков с пагинацией на основе фильтров
            const lessonsQuery = knex('lessons')
            .whereRaw(whereClause, values)
            .orderBy('date', 'asc')
            .offset((pageNumber - 1) * lessonsPerPageNumber)
            .limit(lessonsPerPageNumber);

            const lessons = await lessonsQuery;

        // Форматирование ответа
            const formattedLessons = await Promise.all(lessons.map(async (lesson) => {
            const teachers = await knex('teachers')
                .select('id', 'name')
                .join('lesson_teachers', 'teachers.id', '=', 'lesson_teachers.teacher_id')
                .where('lesson_teachers.lesson_id', lesson.id);

            const students = await knex('students')
                .select('id', 'name', 'visit')
                .join('lesson_students', 'students.id', '=', 'lesson_students.student_id')
                .where('lesson_students.lesson_id', lesson.id);

            const visitCount = students.filter((student) => student.visit).length;

            return {
                id: lesson.id,
                date: lesson.date.toISOString().split('T')[0],
                title: lesson.title,
                status: lesson.status,
                visitCount: visitCount,
                students: students,
                teachers: teachers,
            };
            }));

            res.json({
                lessons: formattedLessons,
                page: pageNumber,
                lessonsPerPage: lessonsPerPageNumber,
                totalCount: totalCount,
            });
            } catch (error) {
                console.error('Error occurred during lesson search:', error.message);
                res.status(400).json({ error: error.message });
            }
    }

    // Задача 2.
    async createLesson(req, res){
        const client = await pool.connect();
        const data = req.body;
        // Валидация входных данных
        const validationError = validateInput(data);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const teacherIds = data.teacherIds.map(Number);
        const title = data.title;
        const days = data.days.map(Number);
        const firstDate = new Date(data.firstDate);
        const lessonsCount = data.lessonsCount;
        const lastDate = data.lastDate ? new Date(data.lastDate) : null;
        const ids = []

        // Рассчет максимального количества занятий на основе диапазона дат
        let maxLessons = MAX_LESSONS;
        if (lastDate && firstDate) {
            const dateDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
            console.log(dateDiff)
            maxLessons = Math.min(maxLessons, dateDiff + 1);
        } else {
            maxLessons = Math.min(maxLessons, MAX_DAYS);
        }
        
        // Рассчет фактического количества уроков для создания
        const numLessons = Math.min(lessonsCount || maxLessons, maxLessons);
        console.log(numLessons)
        try {
            // PostgreSQL client transaction
           
            await client.query('BEGIN');
            

            // Generate lessons
            const createdLessons = [];
            let currentDate = new Date(firstDate);
            let lessonCounter = 0;
        
            while (lessonCounter < numLessons) {
                const day = currentDate.getDay();
                const dayNames = [0, 1, 2, 3, 4, 5, 6];
                let currentDay = dayNames[day]

                if (days.includes(currentDay)) {
                const lesson = {
                    teacherIds: teacherIds,
                    title: title,
                    date: currentDate.toISOString().split('T')[0],
                };
                createdLessons.push(lesson);
                lessonCounter++;
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            for (const lesson of createdLessons) {
                const query = {
                    text: 'INSERT INTO lessons (title, date) VALUES ($1, $2)',
                    values: [lesson.title, lesson.date],
                };
                await client.query(query);
            }
            await client.query('COMMIT');
            client.release();

         
            res.json({ 
                    lessons: createdLessons
             });
         

        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error('Error occurred during lessons creation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
}

function validateInput(data) {
    if (!data.teacherIds.map(Number) || !Array.isArray(data.teacherIds.map(Number))) {
        return "Invalid or missing 'teacherIds' parameter";
    }
    if (!data.title || typeof data.title !== 'string') {
        return "Invalid or missing 'title' parameter";
    }
    if (!data.days || !Array.isArray(data.days)) {
        return "Invalid or missing 'days' parameter";
    }
    if (!data.firstDate || typeof data.firstDate !== 'string') {
        return "Invalid or missing 'firstDate' parameter";
    }
    if ('lessonsCount' in data && 'lastDate' in data) {
        return "Cannot specify both 'lessonsCount' and 'lastDate'";
    }
    return null;
  }

module.exports = new LessonCotroller();