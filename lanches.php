<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
include_once $_SERVER['DOCUMENT_ROOT'] . '/inc/versao.php';
$base = '/Secullum/Lanche';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Controle de Lanches</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="<?= versao("$base/styles.css") ?>">
</head>
<body>
    <div id="main-container">
        <header>
            <div class="header-content">
                <h1><i class="fas fa-utensils"></i> Controle de Lanches</h1>
                <div class="header-buttons">
                    <button id="menu-btn" onclick="toggleMenu()">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
            <p>Bem-vindo, <span id="user-name"></span></p>
        </header>
        <section class="user-container" id="user-container" style="display: none;"></section>
        <section>
            <h2><i class="fas fa-coffee"></i> Pessoas em Lanche</h2><br>
            <div id="lanche-ativo" class="lanche-ativo-container">
                <div class="lanche-ativo-column">
                    <h3><i class="fas fa-star"></i> Especialista</h3>
                    <p id="especialista-mensagem">Nenhum especialista em lanche</p>
                </div>
                <div class="lanche-ativo-column">
                    <h3><i class="fas fa-headset"></i> Ponto/Acesso</h3>
                    <p id="suporte-mensagem">Nenhum ponto/acesso em lanche</p>
                </div>
            </div>
        </section>
        <footer id="footer">
            <p>
                Desenvolvido por
                <a href="https://www.linkedin.com/in/dougllassillva27/" target="_blank">Douglas Silva</a>
            </p>
        </footer>
    </div>
    <div id="menu-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <span class="close" onclick="toggleMenu()">×</span>
            <h2><i class="fas fa-bars"></i> Menu</h2>
            <div class="modal-buttons">
                <button id="manage-users-btn" onclick="window.location.href='<?php echo $base; ?>/gerenciamento_usuarios.php'" style="display: none;">
                    <i class="fas fa-users-cog"></i> Gerenciar Usuários
                </button>
                <button id="report-btn-modal" onclick="window.location.href='<?php echo $base; ?>/relatorios.php'" style="display: none;">
                    <i class="fas fa-file-pdf"></i> Relatórios
                </button>
                <button id="change-password-btn" onclick="openChangePasswordModal(event)">
                    <i class="fas fa-key"></i> Alterar Senha
                </button>
                <button onclick="logout()" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Sair</button>
            </div>
        </div>
    </div>
    <div id="modal" class="modal">
        <div class="modal-content">
            <p id="modal-message"></p>
            <button onclick="closeModal()">Fechar</button>
        </div>
    </div>
    <div id="change-password-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <span class="close" onclick="closeChangePasswordModal()">×</span>
            <h2><i class="fas fa-key"></i> Alterar Senha</h2>
            <form id="change-password-form">
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="new небольшой
                    -password" placeholder="Nova Senha" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="confirm-password" placeholder="Confirmar Nova Senha" required>
                </div>
                <button type="submit"><i class="fas fa-save"></i> Salvar</button>
            </form>
        </div>
    </div>
<script src="<?= versao("$base/script.js") ?>"></script>
</body>
</html>