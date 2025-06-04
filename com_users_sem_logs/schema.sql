CREATE TABLE estado_lanche (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario INT NOT NULL,
    inicio DATETIME NOT NULL
);

CREATE TABLE lanches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario INT NOT NULL,
    inicio DATETIME NOT NULL,
    fim DATETIME,
    duracao VARCHAR(50)
);

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('admin', 'user', 'especialista') NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Usuários iniciais (senha: "senha123")
INSERT INTO usuarios (id, nome, tipo, senha) VALUES
(1, 'supDouglas', 'admin', 'senha123'),
(2, 'supLeonardoF', 'user', 'senha123'),
(3, 'supDiego', 'user', 'senha123'),
(4, 'Admin', 'admin', 'senha123'),
(5, 'supAna', 'especialista', 'senha123');