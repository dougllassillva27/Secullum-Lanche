# Secullum Lanche

Bem-vindo ao **Secullum Lanche**, um sistema web para controle de lanches de especialistas e usuários de Ponto/Acesso, com funcionalidades de gerenciamento de usuários, registro de lanches e geração de relatórios. Este projeto é ideal para equipes que precisam monitorar pausas para lanches, com regras específicas para diferentes tipos de usuários e suporte a relatórios em PDF.

## Funcionalidades

- **Login de Usuários**: Autenticação segura com nome e senha.
- **Controle de Lanches**:
  - Usuários do tipo "especialista" limitados a 1 em lanche por vez.
  - Usuários do tipo "user" limitados a 4 em lanche por vez.
  - Admins podem visualizar e gerenciar todos os lanches.
- **Gerenciamento de Usuários**:
  - Adicionar, editar e excluir usuários (exclusivo para admins).
  - Alterar senhas de usuários (exclusivo para admins) e senha própria.
- **Relatórios**:
  - Filtrar lanches por data, duração (ex.: acima de 15 minutos) e usuários.
  - Visualizar histórico e gerar relatórios em PDF.
- **Interface Responsiva**: Design adaptável para desktops e dispositivos móveis.
- **Atualização em Tempo Real**: Exibição dinâmica de usuários em lanche.

## Tecnologias Utilizadas

- **Frontend**:
  - HTML5, CSS3, JavaScript
  - Font Awesome (ícones)
  - Google Fonts (Inter)
- **Backend**:
  - PHP 7+ com PDO para conexão MySQL
  - TCPDF para geração de relatórios em PDF
- **Banco de Dados**:
  - MySQL
  - Tabelas: `usuarios`, `lanches`, `estado_lanches`
- **Estilização**:
  - CSS customizado com layout responsivo e modais animados

## Estrutura do Projeto

```
Secullum/Lanche/
├── api.php                 # API para autenticação, lanches e relatórios
├── gerenciamento_usuarios.js # Script JS para gerenciamento de usuários
├── gerenciamento_usuarios.php # Página para admins gerenciarem usuários
├── index.php              # Página de login
├── lanches.php            # Página principal de controle de lanches
├── login.js               # Script JS para login
├── relatorios.css         # Estilos para a página de relatórios
├── relatorios.js          # Script JS para filtros e geração de relatórios
├── relatorios.php         # Página de relatórios para admins
├── schema.sql             # Script SQL para criar tabelas e usuários iniciais
├── script.js              # Script JS para lógica geral e controle de lanches
├── styles.css             # Estilos globais do sistema
└── inc/
    └── versao.php         # (Assumido) Função para versionamento de assets
```

## Requisitos

- **Servidor Web**: Apache ou similar com PHP 7+ habilitado
- **Banco de Dados**: MySQL 5.7+
- **Dependências**:
  - TCPDF (incluso em `tcpdf/`)
  - Font Awesome 6.4.2 (via CDN)
  - Google Fonts (Inter, via CDN)
- **Permissões**: Escrita para logs de erro e geração de PDF

## Instalação

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/seu-usuario/secullum-lanche.git
   cd secullum-lanche
   ```

2. **Configure o Banco de Dados**

   - Crie um banco MySQL: `dougl951_lanches_especialista`
   - Atualize as credenciais em `api.php`:
     ```php
     $host = 'localhost';
     $dbname = 'dougl951_lanches_especialista';
     $username = 'dougl951_lanche_especialista';
     $password = '_43690@sa';
     ```
   - Importe o schema:
     ```bash
     mysql -u seu_usuario -p dougl951_lanches_especialista < schema.sql
     ```

3. **Configure o Servidor**

   - Coloque os arquivos em `/Secullum/Lanche` no diretório raiz do servidor (ex.: `/var/www/html/Secullum/Lanche`).
   - Ajuste o caminho em `versao.php` se necessário.

4. **Permissões**

   - Garanta permissões de escrita para o diretório de logs e TCPDF.

5. **Acesse**
   - Abra `http://seu-servidor/Secullum/Lanche/index.php`
   - Use as credenciais iniciais (definidas em `schema.sql`):
     - Nome: `supDouglas`, Senha: `senha123` (admin)
     - Nome: `supAna`, Senha: `senha123` (especialista)
     - Nome: `supLeonardoF`, Senha: `senha123` (user)

## Uso

- **Login**: Acesse com nome e senha em `index.php`.
- **Controle de Lanches**:
  - Usuários não-admins iniciam/finalizam lanches em `lanches.php`.
  - Admins visualizam todos os lanches ativos.
- **Gerenciamento de Usuários**:
  - Admins acessam `gerenciamento_usuarios.php` para criar, editar ou excluir usuários.
- **Relatórios**:
  - Em `relatorios.php`, filtre por data, duração e usuários.
  - Gere PDFs com o botão "Gerar PDF".

## Estrutura do Banco de Dados

- **Tabela: `usuarios`**
  - `id`: INT, auto-incremento, chave primária
  - `nome`: VARCHAR(100), nome do usuário
  - `tipo`: ENUM('admin', 'user', 'especialista')
  - `senha`: VARCHAR(255), senha (sem hash por padrão)
- **Tabela: `lanches`**
  - `id`: INT, auto-incremento, chave primária
  - `usuario`: INT, referência a `usuarios.id`
  - `inicio`: DATETIME, início do lanche
  - `fim`: DATETIME, fim do lanche (pode ser nulo)
  - `duracao`: VARCHAR(50), duração calculada

## Notas de Segurança

- **Senhas**: Atualmente armazenadas em texto plano. Considere implementar hash (ex.: `password_hash` no PHP).
- **CORS**: Configurado para `https://dougllassillva27.com.br`. Ajuste em `api.php` para seu domínio.
- **Validação**: Inputs são validados, mas recomenda-se sanitização adicional.

## Contribuição

1. Faça um fork do repositório.
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit suas mudanças: `git commit -m "Adiciona minha feature"`
4. Envie para o repositório: `git push origin minha-feature`
5. Abra um Pull Request.

## Autor

Desenvolvido por [Douglas Silva](https://www.linkedin.com/in/dougllassillva27/).

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE). (Nota: Adicione um arquivo LICENSE ao repositório.)
