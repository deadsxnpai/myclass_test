
<h2>Краткое описание.</h2> <br>
Требуется создать веб-сервер на базе KoaJS или ExpressJS, который будет работать с данными по занятиям. Данные хранятся в СУБД PostgreSQL, дамп тестовых данных прилагается к тестовому заданию. Предлагается сделать 2 задачи. Первая - запрос данных, вторая - манипуляция с данными. Исполнителю предлагается сделать задачу, выбирая адекватные инструменты и общепринятые способы организации кода и API-интерфейсов, учитывая указанные в задании требования. Необходимо написать тесты для созданных методов. При разработке учитывать, что данных может быть очень много (миллионы занятий).
<hr>

<b>Таблица lessons:</b><br> 
id,<br>
date (дата занятия), <br> 
title (описание, тема занятия), <br> 
status (статус занятия, 1-проведено, 0 - не проведено) <br> <hr>
<b>Таблица teachers:</b><br> 
id, <br> 
name (имя) <br> <hr>
<b>Таблица students:</b> <br> 
id, <br> 
name (имя) <br><hr>
<b>Таблица lesson_teachers:</b> <br> 
Связка учителей и занятий - кто какое занятие ведет. Может быть, что одно занятие ведет несколько учителей. <br><hr>
<b>Таблица lesson_students:</b> <br> 
Связка учеников и занятий - кто на какое занятие записан. Есть дополнительное поле visit - посетил ученик занятие, или нет.<br><hr>

![Иллюстрация к проекту](https://github.com/deadsxnpai/myclass_test/raw/master/myclass/start.png)<hr>
![Иллюстрация к проекту](https://github.com/deadsxnpai/myclass_test/raw/master/myclass/1.png)<hr>
![Иллюстрация к проекту](https://github.com/deadsxnpai/myclass_test/raw/master/myclass/2.png)<hr>
![Иллюстрация к проекту](https://github.com/deadsxnpai/myclass_test/raw/master/myclass/3.png)<hr>