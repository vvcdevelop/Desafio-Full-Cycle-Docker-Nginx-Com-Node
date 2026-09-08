const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

const dbConfig = {
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'nodedb'
};

async function setupDatabase() {
  let retries = 5;
  while (retries) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS people (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL
        )
      `);
      return connection;
    } catch (err) {
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  throw new Error('Falha ao conectar no banco.');
}

app.get('/', async (req, res) => {
  try {
    const connection = await setupDatabase();
    
    // Insere um nome aleatório conforme o fluxo exigido
    const nomes = ['Wescley', 'Luiz', 'Maria', 'João'];
    const nomeSorteado = nomes[Math.floor(Math.random() * nomes.length)];
    await connection.execute('INSERT INTO people (name) VALUES (?)', [nomeSorteado]);
    
    // Busca os registros e monta a string HTML
    const [rows] = await connection.execute('SELECT name FROM people');
    let html = '<h1>Full Cycle Rocks!</h1><ul>';
    rows.forEach(row => { html += `<li>${row.name}</li>`; });
    html += '</ul>';
    
    res.send(html);
    await connection.end();
  } catch (error) {
    res.status(500).send('Erro: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`App na porta ${port}`);
});