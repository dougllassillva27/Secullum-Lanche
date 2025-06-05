<?php
/**
 * MIT License
 *
 * Copyright (c) 2025 Douglas Silva
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
include_once $_SERVER['DOCUMENT_ROOT'] . '/inc/versao.php';
$base = '/Secullum/Lanche';
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'admin') {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Meta Tags Básicas -->
    <meta name="description" content="Secullum Controle de Lanches" />
    <meta name="keywords" content="site, links, lanches, Secullum" />
    <meta name="author" content="Douglas Silva" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:title" content="Secullum Controle de Lanches" />
    <meta property="og:description" content="Secullum Controle de Lanches" />
    <meta property="og:url" content="https://www.dougllassillva27.com.br" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://dougllassillva27.com.br/<?= versao("$base/logo-social-share.webp") ?>">
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:site_name" content="Secullum Controle de Lanches" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Secullum Controle de Lanches" />
    <meta name="twitter:description" content="Secullum Controle de Lanches" />
    <meta name="twitter:image" contcontent="https://dougllassillva27.com.br/<?= versao("$base/logo-social-share.webp") ?>">
    <title>Gerenciar Usuários</title>
    <link rel="stylesheet" href="/Secullum/Lanche/styles.css?v=2.6">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>
<body>
    <div id="main-container">
        <header>
            <div class="header-content">
                <h1><i class="fas fa-users"></i> Gerenciar Usuários</h1>
                <div class="header-buttons">
                    <button onclick="addUser()"><i class="fas fa-user-plus"></i> Adicionar Usuário</button>
                    <button onclick="window.location.href='lanches.php'"><i class="fas fa-arrow-left"></i> Voltar</button>
                </div>
            </div>
        </header>
        <div id="user-list" class="user-container">
            <p class="status-text">Carregando usuários...</p>
        </div>
    </div>

    <div id="user-modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeUserModal()">×</span>
            <h2 id="user-modal-title">Adicionar Usuário</h2>
            <form id="user-form">
                <div class="input-group">
                    <i class="fas fa-user"></i>
                    <input type="text" id="user-nome" placeholder="Nome" required>
                </div>
                <div class="input-group password-form-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="user-senha" placeholder="Senha">
                </div>
                <div class="input-group">
                    <i class="fas fa-user-tag"></i>
                    <select id="user-tipo" required>
                        <option value="admin">Administrador</option>
                        <option value="user">Usuário</option>
                        <option value="especialista">Especialista</option>
                    </select>
                </div>
                <input type="hidden" id="user-id">
                <button type="submit"><i class="fas fa-save"></i> Salvar</button>
            </form>
        </div>
    </div>

    <div id="password-modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closePasswordModal()">×</span>
            <h2>Alterar Senha</h2>
            <form id="password-form">
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="new-password" placeholder="Nova Senha" required>
                </div>
                <input type="hidden" id="password-user-id">
                <button type="submit"><i class="fas fa-key"></i> Alterar</button>
            </form>
        </div>
    </div>

    <div id="delete-modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeDeleteModal()">×</span>
            <h2>Confirmar Exclusão</h2>
            <p>Deseja realmente excluir o usuário <strong id="delete-user-name"></strong>?</p>
            <input type="hidden" id="delete-user-id">
            <div class="modal-buttons">
                <button onclick="confirmDelete()"><i class="fas fa-check"></i> Confirmar</button>
                <button onclick="closeDeleteModal()"><i class="fas fa-times"></i> Cancelar</button>
            </div>
        </div>
    </div>

    <div id="message-modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeMessageModal()">×</span>
            <p id="modal-message"></p>
            <button onclick="closeMessageModal()"><i class="fas fa-check"></i> OK</button>
        </div>
    </div>

    <script>
        window.addEventListener('error', function(e) {
        });
        document.addEventListener('DOMContentLoaded', function() {
            const mainContainer = document.getElementById('main-container');
            if (mainContainer) {
                mainContainer.style.display = 'block';
            }
            document.body.classList.remove('login-page');
        });
    </script>
    <script src="/Secullum/Lanche/gerenciamento_usuarios.js?v=2.6"></script>
    <footer id="footer">
        <p>
            Desenvolvido por
            <a href="https://www.linkedin.com/in/dougllassillva27/" target="_blank">Douglas Silva</a>
        </p>
    </footer>
</body>
</html>