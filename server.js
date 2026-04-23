const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'gestao_estoque'
});

db.connect(err => {
    if (err) console.error('Erro ao conectar ao MySQL:', err);
    else console.log('Conectado ao MySQL Workbench!');
});


app.get('/produtos', (req, res) => {
    db.query('SELECT * FROM produtos ORDER BY nome ASC', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

app.post('/produtos', (req, res) => {
    const { nome, descricao, preco, estoque, estoque_min } = req.body;
    const query = 'INSERT INTO produtos (nome, descricao, preco, estoque, estoque_min) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [nome, descricao, preco, estoque, estoque_min], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, ...req.body });
    });
});


app.put('/produtos/:id', (req, res) => {
    const { nome, descricao, preco, estoque, estoque_min } = req.body;
    const query = 'UPDATE produtos SET nome=?, descricao=?, preco=?, estoque=?, estoque_min=? WHERE id=?';
    
    db.query(query, [nome, descricao, preco, estoque, estoque_min, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Produto atualizado com sucesso');
    });
});


app.delete('/produtos/:id', (req, res) => {
    db.query('DELETE FROM produtos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Excluído com sucesso');
    });
});


app.get('/movimentacoes', (req, res) => {
    const query = `
        SELECT m.id, m.tipo, m.quantidade, DATE_FORMAT(m.data_registro, '%Y-%m-%d') as data_registro, p.nome as produto_nome 
        FROM movimentacoes m 
        JOIN produtos p ON m.produto_id = p.id 
        ORDER BY m.data_registro DESC, m.id DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

app.post('/movimentacoes', (req, res) => {
    const { produto_id, tipo, quantidade, data_registro } = req.body;

    db.query('INSERT INTO movimentacoes (produto_id, tipo, quantidade, data_registro) VALUES (?, ?, ?, ?)', 
    [produto_id, tipo, quantidade, data_registro], (err) => {
        if (err) return res.status(500).send(err);

        const operador = tipo === 'Entrada' ? '+' : '-';
        db.query(`UPDATE produtos SET estoque = estoque ${operador} ? WHERE id = ?`, [quantidade, produto_id], (err2) => {
            if (err2) return res.status(500).send(err2);
            res.send('Movimentação registrada com sucesso!');
        });
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));