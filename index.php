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
session_start();
include_once $_SERVER['DOCUMENT_ROOT'] . '/inc/versao.php';
$base = '/Secullum/Lanche';

// Redireciona para lanches.php se o usuário estiver logado
if (isset($_SESSION['user_id'])) {
    header('Location: lanches.php');
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
    <title>Login - Controle de Lanches</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="<?= versao("$base/styles.css") ?>?v=2.57">
</head>
<body class="login-page">
    <div id="login-container">
        <div class="login-card">
            <h2><i class="fas fa-sign-in-alt"></i> Login - Controle de Lanches</h2>
            <form id="login-form" onsubmit="event.preventDefault(); login();">
                <div class="input-group">
                    <i class="fas fa-user"></i>
                    <input type="text" id="nome" placeholder="Nome" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="senha" placeholder="Senha" required>
                </div>
                <button type="submit"><i class="fas fa-arrow-right"></i> Entrar</button>
            </form>
        </div>
    </div>
    <footer id="footer">
        <p>
            Desenvolvido por
            <a href="https://www.linkedin.com/in/dougllassillva27/" target="_blank">Douglas Silva</a>
        </p>
    </footer>
    <div id="modal" class="modal">
        <div class="modal-content">
            <p id="modal-message"></p>
            <button onclick="closeModal()">Fechar</button>
        </div>
    </div>
    <script src="<?= versao("$base/login.js") ?>?v=2.57"></script>
</body>
</html>