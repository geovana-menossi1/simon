const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path'); // Adiciona o módulo path

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta public

// Configurações do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // ou seu usuário do MySQL
    password: '', // ou sua senha do MySQL
    database: 'user_db'
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL.');
});

// Rota para registrar um novo usuário
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Verifica se o usuário já existe
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length > 0) return res.status(400).send('Usuário já existe.');

        // Hash da senha e insere no banco de dados
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).send(err);
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
                if (err) return res.status(500).send(err);
                res.status(201).send('Usuário registrado com sucesso.');
            });
        });
    });
});

// Rota para logar um usuário
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(400).send('Usuário não encontrado.');

        // Verifica a senha
        bcrypt.compare(password, result[0].password, (err, match) => {
            if (err) return res.status(500).send(err);
            if (!match) return res.status(400).send('Senha incorreta.');
            res.status(200).send('Login bem-sucedido!');
        });
    });
});

// Rota para enviar o score de um jogador
app.post('/submit_score', (req, res) => {
    const { user_id, score } = req.body;

    if (!user_id || !score) {
        return res.status(400).send('User ID e score são obrigatórios.');
    }

    const query = 'INSERT INTO scores (user_id, score) VALUES (?, ?)';
    db.query(query, [user_id, score], (err, result) => {
        if (err) {
            console.error('Erro ao registrar score:', err);
            return res.status(500).send('Erro ao registrar score.');
        }
        res.status(201).send('Score registrado com sucesso.');
    });
});

// Rota para obter o ranking dos jogadores
app.get('/ranking', (req, res) => {
    const query = `
        SELECT users.username, MAX(scores.score) as max_score
        FROM scores
        INNER JOIN users ON scores.user_id = users.id
        GROUP BY users.username
        ORDER BY max_score DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar ranking:', err);
            return res.status(500).send('Erro ao buscar ranking.');
        }
        res.json(results);
    });
});

// Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve o index.html
});

// Rota para servir o simon.html
app.get('/simon', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simon.html'));
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
