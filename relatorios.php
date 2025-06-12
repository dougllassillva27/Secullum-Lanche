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
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'admin') {
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
    <title>Relatórios de Lanches</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="<?= versao("$base/relatorios.css") ?>?v=2.6">
    <script>
        const AppBaseUrl = '<?= $base ?>';
    </script>
</head>
<body>
    <div id="main-container">
        <header>
            <div class="header-content">
                <h1><i class="fas fa-file-pdf"></i> Relatórios de Lanches</h1>
                <div class="header-buttons">
                    <button onclick="window.location.href='lanches.php'"><i class="fas fa-arrow-left"></i> Voltar</button>
                </div>
            </div>
            <p>Bem-vindo, <span id="user-nome"></span></p>
        </header>
        <section class="report-section">
            <h2><i class="fas fa-filter"></i> Filtros do Relatório</h2>
            <div class="filter-controls">
                <input type="date" id="filter-data-inicio" placeholder="Data Início">
                <input type="date" id="filter-data-fim" placeholder="Data Fim">
                <select id="filter-duration">
                    <option value="all">Todas as durações</option>
                    <option value="above15">Somente acima de 15 minutos</option>
                </select>
                <button id="filter-button" onclick="filtrarRelatorio(true)" disabled><i class="fas fa-search"></i> Filtrar</button>
                <button id="gerar-pdf" onclick="gerarRelatorio()" disabled><i class="fas fa-file-pdf"></i> Gerar PDF</button>
            </div>
            <div class="user-selection">
                <label>Selecione os Usuários:</label>
                <div id="user-checkboxes" class="user-checkboxes">
                    <label class="select-all"><input type="checkbox" id="select-all-users" checked> Selecionar todos</label>
                    <p>Carregando usuários...</p>
                </div>
            </div>
            <div id="report-preview" class="report-preview">
                <p>Filtre os dados para visualizar o relatório.</p>
            </div>
        </section>
        <footer id="footer">
            <p>
                Desenvolvido por
                <a href="https://www.linkedin.com/in/dougllassillva27/" target="_blank">Douglas Silva</a>
            </p>
        </footer>
    </div>
    <div id="modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">×</span>
            <p id="modal-message"></p>
            <button onclick="closeModal()"><i class="fas fa-check"></i> OK</button>
        </div>
    </div>
    <script src="<?= versao("$base/relatorios.js") ?>?v=2.6"></script>
</body>
</html>