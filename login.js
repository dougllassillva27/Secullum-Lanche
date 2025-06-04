let currentUser = null;

function showModal(message) {
  const modalMessage = document.getElementById('modal-message');
  if (modalMessage) {
    modalMessage.textContent = message;
    document.getElementById('modal').style.display = 'flex';
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function login() {
  const nomeInput = document.getElementById('nome');
  const senhaInput = document.getElementById('senha');
  if (!nomeInput || !senhaInput) {
    showModal('Erro: Campos de login não encontrados.');
    return;
  }

  const nome = nomeInput.value.trim();
  const senha = senhaInput.value;

  try {
    const response = await fetch('api.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `nome=${encodeURIComponent(nome)}&senha=${encodeURIComponent(senha)}`,
    });
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success) {
      currentUser = {
        id: data.id,
        nome: data.nome,
        tipo: data.tipo,
      };
      window.location.href = 'lanches.php';
    } else {
      showModal(data.error || 'Erro ao fazer login');
    }
  } catch (error) {
    showModal(`Erro ao conectar com o servidor: ${error.message}`);
  }
}

window.onload = async function () {
  try {
    const response = await fetch('api.php?action=check_session', {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success) {
      window.location.href = 'lanches.php';
    } else {
      const loginContainer = document.getElementById('login-container');
      if (loginContainer) {
        loginContainer.style.display = 'flex';
      }
    }
  } catch (error) {
    showModal(`Erro ao verificar sessão: ${error.message}`);
  }
};
