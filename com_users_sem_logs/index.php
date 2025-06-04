<?php
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