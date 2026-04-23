
CREATE DATABASE IF NOT EXISTS gestao_estoque;
USE gestao_estoque;


CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    estoque_min INT NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    tipo ENUM('Entrada', 'Saida') NOT NULL,
    quantidade INT NOT NULL,
    data_registro DATE NOT NULL,
   
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);