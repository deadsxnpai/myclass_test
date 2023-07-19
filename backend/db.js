const { Pool } = require('pg');

// Конфигурация подключения к базе данных
const pool = new Pool({
  user: 'postgres',
  password: '1111',
  host: 'localhost',
  port: 5432, // Порт по умолчанию для PostgreSQL
  database: 'postgres',
  max: 20, // Максимальное количество соединений в пуле
  idleTimeoutMillis: 30000, // Время ожидания перед завершением неиспользуемого соединения
  connectionTimeoutMillis: 2000, // Время ожидания установки соединения
});

module.exports = pool;