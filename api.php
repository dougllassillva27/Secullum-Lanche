<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dougllassillva27.com.br');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'tcpdf/tcpdf.php';

// Configuração do banco de dados
$host = 'localhost';
$dbname = 'dougl951_lanches_especialista';
$username = 'dougl951_lanche_especialista';
$password = '_43690@sa';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Conexão falhou: ' . $e->getMessage()]);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

function sendResponse($data) {
    echo json_encode($data);
    exit;
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isAdmin() {
    return isLoggedIn() && $_SESSION['user_tipo'] === 'admin';
}

// Função auxiliar para formatar duração no relatório (em segundos -> Xm Ys)
function formatDuration($seconds) {
    try {
        if (!is_numeric($seconds) || $seconds <= 0) {
            return 'Indisponível';
        }
        $totalMinutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;
        return "{$totalMinutes}m {$remainingSeconds}s";
    } catch (Exception $e) {
        return 'Indisponível';
    }
}

// Classe personalizada para o PDF
class MYPDF extends TCPDF {
    public $startY;

    public function Header() {
        if ($this->getPage() == 1) {
            $this->SetFont('dejavusans', 'B', 14);
            $this->SetTextColor(44, 62, 80);
            $this->Cell(0, 10, 'Relatório de Lanches', 0, 1, 'C');
            $this->Ln(2);

            $this->SetFont('dejavusans', '', 9);
            $this->SetTextColor(0, 0, 0);

            $data_inicio = isset($_GET['data_inicio']) ? $_GET['data_inicio'] : null;
            $data_fim = isset($_GET['data_fim']) ? $_GET['data_fim'] : null;
            $filtro_texto = 'Sem filtro de data';
            if ($data_inicio && $data_fim) {
                $filtro_texto = 'De ' . date('d/m/Y', strtotime($data_inicio)) . ' até ' . date('d/m/Y', strtotime($data_fim));
            } elseif ($data_inicio) {
                $filtro_texto = 'A partir de ' . date('d/m/Y', strtotime($data_inicio));
            } elseif ($data_fim) {
                $filtro_texto = 'Até ' . date('d/m/Y', strtotime($data_fim));
            }
            $this->Cell(0, 6, 'Gerado em: ' . date('d/m/Y H:i:s'), 0, 0, 'L');
            $this->Cell(0, 6, 'Filtro: ' . $filtro_texto, 0, 1, 'R');
            $this->Ln(5);
        }

        $this->SetFont('dejavusans', 'B', 10);
        $this->SetFillColor(44, 62, 80);
        $this->SetTextColor(255, 255, 255);
        $this->Cell(60, 8, 'Usuário', 1, 0, 'C', 1);
        $this->Cell(55, 8, 'Início', 1, 0, 'C', 1);
        $this->Cell(55, 8, 'Fim', 1, 0, 'C', 1);
        $this->Cell(40, 8, 'Duração', 1, 0, 'C', 1);
        $this->Cell(57, 8, 'Turno', 1, 0, 'C', 1);
        $this->Ln();
        $this->startY = $this->GetY();
    }

    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('dejavusans', 'I', 8);
        $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
    }
}

try {
    switch ($action) {
        case 'login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
            $senha = isset($_POST['senha']) ? $_POST['senha'] : '';
            if (empty($nome) || empty($senha)) {
                sendResponse(['error' => 'Nome e senha são obrigatórios']);
            }
            $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE nome = ?');
            $stmt->execute([$nome]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$user || $senha !== $user['senha']) {
                sendResponse(['error' => 'Credenciais inválidas']);
            }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nome'] = $user['nome'];
            $_SESSION['user_tipo'] = $user['tipo'];
            sendResponse(['success' => true, 'id' => $user['id'], 'nome' => $user['nome'], 'tipo' => $user['tipo']]);
            break;

        case 'check_session':
            if (isLoggedIn()) {
                sendResponse(['success' => true, 'id' => $_SESSION['user_id'], 'nome' => $_SESSION['user_nome'], 'tipo' => $_SESSION['user_tipo']]);
            } else {
                sendResponse(['success' => false]);
            }
            break;

        case 'logout':
            session_destroy();
            sendResponse(['success' => true]);
            break;

        case 'status':
            try {
                $stmt = $pdo->prepare("SELECT l.id, l.usuario, l.inicio, u.tipo 
                                      FROM lanches l 
                                      INNER JOIN usuarios u ON l.usuario = u.id 
                                      WHERE l.fim IS NULL");
                $stmt->execute();
                $lanchesAtivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $userCount = 0;
                $especialistaCount = 0;
                foreach ($lanchesAtivos as $lanche) {
                    if ($lanche['tipo'] === 'user') {
                        $userCount++;
                    } elseif ($lanche['tipo'] === 'especialista') {
                        $especialistaCount++;
                    }
                }
                sendResponse([
                    'lanches' => $lanchesAtivos,
                    'counts' => [
                        'user' => $userCount,
                        'especialista' => $especialistaCount
                    ]
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                sendResponse(['error' => 'Erro ao obter status: ' . $e->getMessage()]);
            }
            break;

        case 'get_user_name':
            $user_id = $_GET['user_id'] ?? null;
            if (!$user_id) {
                sendResponse(['error' => 'ID do usuário inválido']);
            }
            $stmt = $pdo->prepare("SELECT nome FROM usuarios WHERE id = :user_id");
            $stmt->execute(['user_id' => $user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            sendResponse($user ? ['nome' => $user['nome']] : ['error' => 'Usuário não encontrado']);
            break;

        case 'start':
            if (!isLoggedIn()) {
                sendResponse(['error' => 'Não autenticado']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $usuario = isset($_POST['usuario']) ? (int)$_POST['usuario'] : 0;
            if ($usuario < 1) {
                sendResponse(['error' => 'Usuário inválido']);
            }
            if (!isAdmin() && $usuario !== (int)$_SESSION['user_id']) {
                sendResponse(['error' => 'Permissão negada']);
            }
            try {
                $stmt = $pdo->prepare("SELECT tipo FROM usuarios WHERE id = :usuario");
                $stmt->execute(['usuario' => $usuario]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$user) {
                    sendResponse(['error' => 'Usuário não encontrado']);
                }
                $tipoUsuario = $user['tipo'];

                $stmt = $pdo->prepare("SELECT u.tipo, COUNT(*) as count 
                                      FROM lanches l 
                                      INNER JOIN usuarios u ON l.usuario = u.id 
                                      WHERE l.fim IS NULL 
                                      GROUP BY u.tipo");
                $stmt->execute();
                $counts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
                $userCount = isset($counts['user']) ? (int)$counts['user'] : 0;
                $especialistaCount = isset($counts['especialista']) ? (int)$counts['especialista'] : 0;

                if ($tipoUsuario === 'especialista' && $especialistaCount >= 1) {
                    sendResponse(['error' => 'Já existe um especialista em lanche']);
                }
                if ($tipoUsuario === 'user' && $userCount >= 4) {
                    sendResponse(['error' => 'Limite de 4 usuários em lanche atingido']);
                }

                $stmt = $pdo->prepare("INSERT INTO lanches (usuario, inicio) VALUES (:usuario, NOW())");
                $result = $stmt->execute(['usuario' => $usuario]);
                sendResponse(['success' => $result]);
            } catch (PDOException $e) {
                sendResponse(['error' => 'Erro ao iniciar lanche: ' . $e->getMessage()]);
            }
            break;

        case 'end':
            if (!isLoggedIn()) {
                sendResponse(['error' => 'Não autenticado']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $usuario = isset($_POST['usuario']) ? (int)$_POST['usuario'] : 0;
            if ($usuario < 1) {
                sendResponse(['error' => 'Usuário inválido']);
            }
            if (!isAdmin() && $usuario !== (int)$_SESSION['user_id']) {
                sendResponse(['error' => 'Permissão negada']);
            }
            try {
                $stmt = $pdo->prepare("UPDATE lanches SET fim = NOW() WHERE usuario = :usuario AND fim IS NULL");
                $result = $stmt->execute(['usuario' => $usuario]);
                sendResponse(['success' => $result]);
            } catch (PDOException $e) {
                sendResponse(['error' => 'Erro ao finalizar lanche: ' . $e->getMessage()]);
            }
            break;

        case 'list_users':
            if (!isAdmin()) {
                sendResponse(['error' => 'Permissão negada']);
            }
            $stmt = $pdo->query("SELECT id, nome, tipo FROM usuarios ORDER BY nome");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse($users);
            break;

        case 'add_user':
            if (!isAdmin()) {
                sendResponse(['error' => 'Permissão negada']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $nome = trim($_POST['nome'] ?? '');
            $senha = $_POST['senha'] ?? '';
            $tipo = $_POST['tipo'] ?? '';
            if (empty($nome) || empty($senha) || !in_array($tipo, ['admin', 'user', 'especialista'])) {
                sendResponse(['error' => 'Nome, senha e tipo válido são obrigatórios']);
            }
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE nome = :nome");
            $stmt->execute(['nome' => $nome]);
            if ($stmt->fetchColumn() > 0) {
                sendResponse(['error' => 'Nome de usuário já existe']);
            }
            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, senha, tipo) VALUES (:nome, :senha, :tipo)");
            $result = $stmt->execute(['nome' => $nome, 'senha' => $senha, 'tipo' => $tipo]);
            sendResponse(['success' => $result]);
            break;

        case 'edit_user':
            if (!isAdmin()) {
                sendResponse(['error' => 'Permissão negada']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $id = (int)($_POST['id'] ?? 0);
            $nome = trim($_POST['nome'] ?? '');
            $tipo = $_POST['tipo'] ?? '';
            if ($id < 1 || empty($nome) || !in_array($tipo, ['admin', 'user', 'especialista'])) {
                sendResponse(['error' => 'ID, nome e tipo válido são obrigatórios']);
            }
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE nome = :nome AND id != :id");
            $stmt->execute(['nome' => $nome, 'id' => $id]);
            if ($stmt->fetchColumn() > 0) {
                sendResponse(['error' => 'Nome de usuário já existe']);
            }
            $stmt = $pdo->prepare("UPDATE usuarios SET nome = :nome, tipo = :tipo WHERE id = :id");
            $result = $stmt->execute(['nome' => $nome, 'tipo' => $tipo, 'id' => $id]);
            sendResponse(['success' => $result]);
            break;

        case 'change_password':
            if (!isAdmin()) {
                sendResponse(['error' => 'Permissão negada']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $id = (int)($_POST['id'] ?? 0);
            $senha = $_POST['senha'] ?? '';
            if ($id < 1 || empty($senha)) {
                sendResponse(['error' => 'ID e senha são obrigatórios']);
            }
            $stmt = $pdo->prepare("UPDATE usuarios SET senha = :senha WHERE id = :id");
            $result = $stmt->execute(['senha' => $senha, 'id' => $id]);
            sendResponse(['success' => $result]);
            break;

        case 'change_own_password':
            if (!isLoggedIn()) {
                sendResponse(['error' => 'Não autenticado']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $newPassword = $_POST['new_password'] ?? '';
            if (empty($newPassword)) {
                sendResponse(['error' => 'Nova senha é obrigatória']);
            }
            try {
                $userId = (int)$_SESSION['user_id'];
                $stmt = $pdo->prepare("UPDATE usuarios SET senha = :senha WHERE id = :id");
                $result = $stmt->execute(['senha' => $newPassword, 'id' => $userId]);
                sendResponse(['success' => $result]);
            } catch (PDOException $e) {
                sendResponse(['error' => 'Erro ao alterar senha: ' . $e->getMessage()]);
            }
            break;

        case 'delete_user':
            if (!isAdmin()) {
                sendResponse(['error' => 'Permissão negada']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $id = (int)($_POST['id'] ?? 0);
            if ($id < 1) {
                sendResponse(['error' => 'ID inválido']);
            }
            if ($id == $_SESSION['user_id']) {
                sendResponse(['error' => 'Não é possível excluir o próprio usuário']);
            }
            $stmt = $pdo->prepare("DELETE FROM lanches WHERE usuario = :id");
            $stmt->execute(['id' => $id]);
            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = :id");
            $result = $stmt->execute(['id' => $id]);
            sendResponse(['success' => $result]);
            break;

        case 'history':
            if (!isAdmin()) {
                sendResponse(['error' => 'Permissão negada']);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendResponse(['error' => 'Método inválido']);
            }
            $data_inicio = $_POST['data_inicio'] ?? '';
            $data_fim = $_POST['data_fim'] ?? '';
            $limit = (int)($_POST['limit'] ?? 10);
            if ($limit < 1) {
                $limit = 10;
            }
            $sql = "SELECT u.nome, l.inicio, l.fim, l.usuario 
                    FROM lanches l 
                    INNER JOIN usuarios u ON l.usuario = u.id";
            $params = [];
            if ($data_inicio) {
                $sql .= " AND l.inicio >= :data_inicio";
                $params['data_inicio'] = $data_inicio . ' 00:00:00';
            }
            if ($data_fim) {
                $sql .= " AND l.inicio <= :data_fim";
                $params['data_fim'] = $data_fim . ' 23:59:59';
            }
            $sql .= " ORDER BY l.inicio DESC LIMIT :limit";
            try {
                $stmt = $pdo->prepare($sql);
                foreach ($params as $key => $value) {
                    $stmt->bindValue(":$key", $value);
                }
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
                $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
                sendResponse($history);
            } catch (PDOException $e) {
                throw new Exception("Erro na consulta do histórico: " . $e->getMessage());
            }
            break;

        case 'report':
            if (!isAdmin()) {
                sendResponse(['error' => 'Permissão negada']);
            }
            if (!$_GET['data_inicio'] && !$_GET['data_fim']) {
                sendResponse(['error' => 'Pelo menos uma data (início ou fim) é obrigatória para o relatório']);
            }
            ob_start();
            if (!file_exists('tcpdf/tcpdf.php')) {
                http_response_code(500);
                ob_end_clean();
                sendResponse(['error' => 'Biblioteca TCPDF não encontrada']);
            }
            $data_inicio = $_GET['data_inicio'] ?? '';
            $data_fim = $_GET['data_fim'] ?? '';
            $users = isset($_GET['users']) ? explode(',', $_GET['users']) : [];
            $durationFilter = $_GET['duration'] ?? '';
            $sql = "SELECT u.nome, l.inicio, l.fim 
                    FROM lanches l 
                    INNER JOIN usuarios u ON l.usuario = u.id";
            $params = [];
            if ($data_inicio) {
                $sql .= " AND l.inicio >= :data_inicio";
                $params['data_inicio'] = $data_inicio . ' 00:00:00';
            }
            if ($data_fim) {
                $sql .= " AND l.inicio <= :data_fim";
                $params['data_fim'] = $data_fim . ' 23:59:59';
            }
            if (!empty($users)) {
                $placeholders = [];
                foreach ($users as $index => $userId) {
                    $placeholders[] = ":user_$index";
                    $params["user_$index"] = (int)$userId;
                }
                $sql .= " AND l.usuario IN (" . implode(',', $placeholders) . ")";
            }
            $sql .= " ORDER BY l.inicio DESC";
            try {
                $stmt = $pdo->prepare($sql);
                foreach ($params as $key => $value) {
                    $paramType = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
                    $stmt->bindValue(":$key", $value, $paramType);
                }
                $stmt->execute();
                $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if ($durationFilter === 'above15') {
                    $history = array_filter($history, function($log) {
                        if (is_null($log['fim']) || $log['fim'] === '' || $log['fim'] === '0000-00-00 00:00:00') {
                            return false;
                        }
                        $inicio = strtotime($log['inicio']);
                        $fim = strtotime($log['fim']);
                        if ($inicio === false || $fim === false) {
                            return false;
                        }
                        $totalMinutes = ($fim - $inicio) / 60;
                        return $totalMinutes > 15;
                    });
                }
            } catch (PDOException $e) {
                ob_end_clean();
                throw new Exception("Erro na consulta do relatório: " . $e->getMessage());
            }

            try {
                $pdf = new MYPDF('L', 'mm', 'A4', true, 'UTF-8', false);
                $pdf->SetCreator(PDF_CREATOR);
                $pdf->SetAuthor('Secullum Lanche Especialista');
                $pdf->SetTitle('Relatório de Lanches');
                $pdf->SetMargins(15, 40, 15);
                $pdf->SetHeaderMargin(5);
                $pdf->SetFooterMargin(15);
                $pdf->SetAutoPageBreak(TRUE, 15);
                $pdf->setFontSubsetting(true);
                $pdf->AddPage();
                $pdf->SetY($pdf->startY);
                $pdf->SetFont('dejavusans', '', 9);
                $pdf->SetFillColor(245, 245, 245);
                $fill = false;

                foreach ($history as $log) {
                    if ($pdf->GetY() > $pdf->getPageHeight() - 15 - 7) {
                        $pdf->AddPage();
                        $pdf->SetY($pdf->startY);
                    }
                    $horaInicio = date('H:i:s', strtotime($log['inicio']));
                    $turno = 'Outro';
                    if ($horaInicio >= '08:00:00' && $horaInicio <= '12:00:00') {
                        $turno = 'Manhã';
                    } elseif ($horaInicio >= '13:00:00' && $horaInicio <= '18:00:00') {
                        $turno = 'Tarde';
                    }
                    $fim = (is_null($log['fim']) || $log['fim'] === '' || $log['fim'] === '0000-00-00 00:00:00') ? 'Sem horário fim' : date('d/m/Y H:i:s', strtotime($log['fim']));
                    $duracao = (is_null($log['fim']) || $log['fim'] === '' || $log['fim'] === '0000-00-00 00:00:00') ? 'Indisponível' : formatDuration(strtotime($log['fim']) - strtotime($log['inicio']));
                    $pdf->Cell(60, 7, $log['nome'], 1, 0, 'L', $fill);
                    $pdf->Cell(55, 7, date('d/m/Y H:i:s', strtotime($log['inicio'])), 1, 0, 'C', $fill);
                    $pdf->Cell(55, 7, $fim, 1, 0, 'C', $fill);
                    $pdf->Cell(40, 7, $duracao, 1, 0, 'C', $fill);
                    $pdf->Cell(57, 7, $turno, 1, 1, 'C', $fill);
                    $fill = !$fill;
                }

                $nomeArquivo = 'relatorio_lanches.pdf';
                if ($data_inicio || $data_fim) {
                    $dataFormatada = '';
                    if ($data_inicio && $data_fim) {
                        $dataFormatada = str_replace('/', '-', date('d-m-Y', strtotime($data_inicio))) . '_ate_' . str_replace('/', '-', date('d-m-Y', strtotime($data_fim)));
                    } elseif ($data_inicio) {
                        $dataFormatada = 'a_partir_de_' . str_replace('/', '-', date('d-m-Y', strtotime($data_inicio)));
                    } elseif ($data_fim) {
                        $dataFormatada = 'ate_' . str_replace('/', '-', date('d-m-Y', strtotime($data_fim)));
                    }
                    $nomeArquivo = 'Relatorio_Lanches_' . $dataFormatada . '.pdf';
                }

                ob_end_clean();
                $pdf->Output($nomeArquivo, 'I');
                exit;
            } catch (Exception $e) {
                ob_end_clean();
                http_response_code(500);
                sendResponse(['error' => 'Erro ao gerar relatório PDF: ' . $e->getMessage()]);
            }
            break;

        default:
            sendResponse(['error' => 'Ação inválida']);
    }
} catch (Exception $e) {
    http_response_code(500);
    sendResponse(['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>