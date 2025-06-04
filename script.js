let currentUser = null;
let refreshInterval = null;
let currentFilter = { inicio: null, fim: null };
let isOpeningChangePasswordModal = false;

function showModal(message) {
  console.log('Exibindo modal com mensagem:', message);
  const modalMessage = document.getElementById('modal-message');
  const modal = document.getElementById('modal');
  if (modalMessage && modal) {
    modalMessage.textContent = message;
    modal.style.display = 'flex';
  } else {
    console.error('Elementos modal-message ou modal não encontrados:', {
      modalMessage: !!modalMessage,
      modal: !!modal,
    });
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function toggleMenu() {
  const menuModal = document.getElementById('menu-modal');
  const manageUsersBtn = document.getElementById('manage-users-btn');
  const reportBtn = document.getElementById('report-btn-modal');
  if (!menuModal || !manageUsersBtn || !reportBtn) {
    console.error('Elementos do menu não encontrados:', {
      menuModal: !!menuModal,
      manageUsersBtn: !!manageUsersBtn,
      reportBtn: !!reportBtn,
    });
    showModal('Erro ao abrir o menu');
    return;
  }
  try {
    const isVisible = menuModal.style.display === 'flex';
    menuModal.style.display = isVisible ? 'none' : 'flex';
    const isAdmin = currentUser && currentUser.tipo === 'admin';
    manageUsersBtn.style.display = isAdmin ? 'block' : 'none';
    reportBtn.style.display = isAdmin ? 'block' : 'none';
  } catch (error) {
    console.error('Erro ao manipular menu:', error);
    showModal('Erro ao abrir/fechar menu');
  }
}

function openChangePasswordModal(event) {
  if (event) {
    event.stopPropagation();
    console.log('Propagação do evento de clique parada');
  }
  console.log('Abrindo modal de alteração de senha');
  isOpeningChangePasswordModal = true;
  const menuModal = document.getElementById('menu-modal');
  if (menuModal && menuModal.style.display === 'flex') {
    console.log('Fechando menu-modal antes de abrir change-password-modal');
    menuModal.style.display = 'none';
  }
  const modal = document.getElementById('change-password-modal');
  const form = document.getElementById('change-password-form');
  if (modal && form) {
    form.reset();
    modal.style.display = 'flex';
    console.log('Modal change-password-modal aberto. Estilo atual:', modal.style.display);
    setTimeout(() => {
      console.log('Verificando visibilidade após 100ms:', modal.style.display, window.getComputedStyle(modal).display);
      isOpeningChangePasswordModal = false;
    }, 100);
  } else {
    console.error('Elementos do modal de senha não encontrados:', {
      modal: !!modal,
      form: !!form,
    });
    showModal('Erro: Não foi possível abrir o formulário de senha.');
    isOpeningChangePasswordModal = false;
  }
}

function closeChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  const form = document.getElementById('change-password-form');
  if (modal && form) {
    modal.style.display = 'none';
    form.reset();
    console.log('Modal change-password-modal fechado.');
  }
}

async function logout() {
  try {
    const response = await fetch('api.php?action=logout');
    if (!response.ok) {
      throw new Error(`Erro ao fazer logout: HTTP ${response.status}`);
    }
    currentUser = null;
    window.location.href = 'index.php';
  } catch (error) {
    console.error('Erro ao sair:', error);
    showModal(`Erro ao sair do sistema: ${error.message}`);
  }
}

async function getUserName(userId) {
  try {
    const response = await fetch(`api.php?action=get_user_name&user_id=${userId}`);
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.nome || 'Desconhecido';
  } catch (error) {
    console.error('Erro ao obter nome do usuário:', error);
    return 'Desconhecido';
  }
}

async function toggleLanche(usuario) {
  if (!currentUser) {
    showModal('Erro: Usuário não autenticado');
    return;
  }
  if (parseInt(currentUser.id) !== usuario) {
    showModal('Permissão negada: você só pode manipular seu próprio lanche.');
    return;
  }
  try {
    const response = await fetch('api.php?action=status');
    if (!response.ok) {
      throw new Error(`Erro ao verificar status: HTTP ${response.status}`);
    }
    const estado = await response.json();
    const isUserInLanche = estado.lanches.some((lanche) => lanche.usuario === usuario);
    const action = isUserInLanche ? 'end' : 'start';
    const res = await fetch(`api.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `usuario=${encodeURIComponent(usuario)}`,
    });
    if (!res.ok) {
      throw new Error(`Erro ao executar ação ${action}: HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.success) {
      await atualizarInterface();
    } else {
      showModal(data.error || `Erro ao ${action === 'start' ? 'iniciar' : 'finalizar'} lanche`);
    }
  } catch (error) {
    console.error('Erro ao manipular lanche:', error);
    showModal(`Erro ao conectar com o servidor: ${error.message}`);
  }
}

async function gerarRelatorio() {
  try {
    let url = 'api.php?action=report';
    if (currentFilter.inicio || currentFilter.fim) {
      const params = new URLSearchParams();
      if (currentFilter.inicio) params.append('data_inicio', currentFilter.inicio);
      if (currentFilter.fim) params.append('data_fim', currentFilter.fim);
      url += `&${params.toString()}`;
    }
    window.open(url, '_blank');
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    showModal(`Erro ao gerar relatório: ${error.message}`);
  }
}

function formatarDuracaoAtiva(inicio) {
  try {
    const dataInicio = new Date(inicio);
    if (isNaN(dataInicio)) return 'Indisponível';
    const agora = new Date();
    const diffMs = agora - dataInicio;
    const totalMinutos = Math.floor(diffMs / 60000);
    const totalSegundos = Math.floor((diffMs % 60000) / 1000);
    return `${totalMinutos}m ${totalSegundos}s`;
  } catch (error) {
    console.error('Erro ao formatar duração ativa:', error);
    return 'Indisponível';
  }
}

async function atualizarInterface() {
  if (!currentUser) {
    showModal('Erro: Usuário não autenticado');
    return;
  }
  try {
    const response = await fetch('api.php?action=status');
    if (!response.ok) {
      throw new Error(`Erro ao obter status: HTTP ${response.status}`);
    }
    const estado = await response.json();
    // Atualizar seção "Pessoas em Lanche"
    const lancheAtivo = document.getElementById('lanche-ativo');
    if (lancheAtivo) {
      const especialistaContainer = lancheAtivo.querySelector('.lanche-ativo-column:nth-child(1)');
      const suporteContainer = lancheAtivo.querySelector('.lanche-ativo-column:nth-child(2)');
      if (estado.lanches.length > 0) {
        let htmlEspecialista = '';
        let htmlSuporte = '';
        for (const lanche of estado.lanches) {
          const nomeUsuario = await getUserName(lanche.usuario);
          const duracao = formatarDuracaoAtiva(lanche.inicio);
          const isAdmin = currentUser && currentUser.tipo === 'admin';
          const displayText = isAdmin ? `${nomeUsuario} (${lanche.tipo})` : nomeUsuario;
          const card = `<div class="lanche-ativo-card"><a>${displayText} - ${duracao}</a><br></div>`;
          if (lanche.tipo === 'especialista') {
            htmlEspecialista += card;
          } else if (lanche.tipo === 'user') {
            htmlSuporte += card;
          }
        }
        especialistaContainer.innerHTML = htmlEspecialista || '<p id="especialista-mensagem">Nenhum especialista em lanche</p>';
        suporteContainer.innerHTML = htmlSuporte || '<p id="suporte-mensagem">Nenhum ponto/acesso em lanche</p>';
        // Adicionar cabeçalhos dinamicamente
        if (!especialistaContainer.querySelector('h3')) {
          especialistaContainer.insertAdjacentHTML('afterbegin', '<h3><i class="fas fa-star"></i> Especialista</h3>');
        }
        if (!suporteContainer.querySelector('h3')) {
          suporteContainer.insertAdjacentHTML('afterbegin', '<h3><i class="fas fa-headset"></i> Ponto/Acesso</h3>');
        }
      } else {
        especialistaContainer.innerHTML = '<h3><i class="fas fa-star"></i> Especialista</h3><p id="especialista-mensagem">Nenhum especialista em lanche</p>';
        suporteContainer.innerHTML = '<h3><i class="fas fa-headset"></i> Ponto/Acesso</h3><p id="suporte-mensagem">Nenhum ponto/acesso em lanche</p>';
      }
    } else {
      console.error('Elemento lanche-ativo não encontrado');
    }
    // Atualizar user-container apenas para não-admins
    const userContainer = document.getElementById('user-container');
    if (!userContainer) {
      console.error('Elemento user-container não encontrado');
      return;
    }
    if (currentUser.tipo !== 'admin') {
      userContainer.style.display = 'grid';
      userContainer.innerHTML = '';
      const box = document.createElement('div');
      box.className = 'user-box';
      box.id = `box-${currentUser.id}`;
      box.innerHTML = `
        <h3>${currentUser.nome}</h3>
        <p id="status-${currentUser.id}" class="status-text">Status: Aguardando</p>
        <button id="btn-${currentUser.id}" onclick="toggleLanche(${currentUser.id})">Iniciar Lanche</button>
      `;
      userContainer.appendChild(box);
      const btn = document.getElementById(`btn-${currentUser.id}`);
      const status = document.getElementById(`status-${currentUser.id}`);
      const isUserInLanche = estado.lanches.some((lanche) => lanche.usuario === currentUser.id);
      if (isUserInLanche) {
        btn.textContent = 'Finalizar Lanche';
        btn.classList.add('finalizar');
        const lanche = estado.lanches.find((lanche) => lanche.usuario === currentUser.id);
        status.innerHTML = `Status:<br><strong>Em lanche desde ${formatarData(lanche.inicio)}</strong>`;
        btn.disabled = false;
      } else {
        btn.textContent = 'Iniciar Lanche';
        btn.classList.remove('finalizar');
        status.textContent = 'Status: Aguardando';
        if (currentUser.tipo === 'especialista') {
          btn.disabled = estado.counts.especialista >= 1;
        } else if (currentUser.tipo === 'user') {
          btn.disabled = estado.counts.user >= 4;
        } else {
          btn.disabled = false;
        }
      }
    } else {
      userContainer.style.display = 'none';
    }
  } catch (error) {
    console.error('Erro ao atualizar interface:', error);
    showModal(`Erro ao carregar dados: ${error.message}`);
  }
}

async function atualizarLancheAtivo() {
  console.log('Atualizando lanche ativo...');
  try {
    const response = await fetch('api.php?action=status');
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }
    const estado = await response.json();
    const lancheAtivo = document.getElementById('lanche-ativo');
    if (lancheAtivo) {
      const especialistaContainer = lancheAtivo.querySelector('.lanche-ativo-column:nth-child(1)');
      const suporteContainer = lancheAtivo.querySelector('.lanche-ativo-column:nth-child(2)');
      if (estado.lanches.length > 0) {
        let htmlEspecialista = '';
        let htmlSuporte = '';
        for (const lanche of estado.lanches) {
          const nomeUsuario = await getUserName(lanche.usuario);
          const duracao = formatarDuracaoAtiva(lanche.inicio);
          const isAdmin = currentUser && currentUser.tipo === 'admin';
          const displayText = isAdmin ? `${nomeUsuario} (${lanche.tipo})` : nomeUsuario;
          const card = `<div class="lanche-ativo-card"><a>${displayText} - ${duracao}</a><br></div>`;
          if (lanche.tipo === 'especialista') {
            htmlEspecialista += card;
          } else if (lanche.tipo === 'user') {
            htmlSuporte += card;
          }
        }
        especialistaContainer.innerHTML = htmlEspecialista || '<p id="especialista-mensagem">Nenhum especialista em lanche</p>';
        suporteContainer.innerHTML = htmlSuporte || '<p id="suporte-mensagem">Nenhum ponto/acesso em lanche</p>';
        // Adicionar cabeçalhos dinamicamente
        if (!especialistaContainer.querySelector('h3')) {
          especialistaContainer.insertAdjacentHTML('afterbegin', '<h3><i class="fas fa-star"></i> Especialista</h3>');
        }
        if (!suporteContainer.querySelector('h3')) {
          suporteContainer.insertAdjacentHTML('afterbegin', '<h3><i class="fas fa-headset"></i> Ponto/Acesso</h3>');
        }
      } else {
        especialistaContainer.innerHTML = '<h3><i class="fas fa-star"></i> Especialista</h3><p id="especialista-mensagem">Nenhum especialista em lanche</p>';
        suporteContainer.innerHTML = '<h3><i class="fas fa-headset"></i> Ponto/Acesso</h3><p id="suporte-mensagem">Nenhum ponto/acesso em lanche</p>';
      }
    } else {
      console.error('Elemento lanche-ativo não encontrado');
    }
  } catch (error) {
    console.error('Erro ao atualizar lanche ativo:', error);
  }
}

function startLancheRefresh() {
  console.log('Iniciando refresh automático...');
  stopLancheRefresh();
  refreshInterval = setInterval(atualizarLancheAtivo, 30000);
}

function stopLancheRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('Refresh automático parado.');
  }
}

function formatarData(data) {
  try {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Indisponível';
  }
}

document.addEventListener('submit', async function (event) {
  if (event.target.id === 'change-password-form') {
    event.preventDefault();
    console.log('Enviando formulário de alteração de senha');
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    if (!newPassword || !confirmPassword) {
      showModal('Erro: Todos os campos são obrigatórios');
      return;
    }
    if (newPassword !== confirmPassword) {
      showModal('Erro: A nova senha e a confirmação não coincidem');
      return;
    }
    try {
      const response = await fetch('api.php?action=change_own_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `new_password=${encodeURIComponent(newPassword)}`,
      });
      const data = await response.json();
      console.log('Resposta da API:', data);
      if (data.success) {
        showModal('Senha alterada com sucesso!');
        closeChangePasswordModal();
      } else {
        showModal(`Erro: ${data.error || 'Falha ao alterar senha'}`);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      showModal(`Erro ao conectar com o servidor: ${error.message}`);
    }
  }
});

document.addEventListener('click', function (event) {
  const menuModal = document.getElementById('menu-modal');
  const menuModalContent = menuModal?.querySelector('.modal-content');
  const menuBtn = document.getElementById('menu-btn');
  if (menuModal && menuModalContent && menuModal.style.display === 'flex') {
    if (!menuModalContent.contains(event.target) && !menuBtn.contains(event.target)) {
      toggleMenu();
    }
  }
  const changePasswordModal = document.getElementById('change-password-modal');
  const changePasswordModalContent = changePasswordModal?.querySelector('.modal-content');
  const changePasswordBtn = document.getElementById('change-password-btn');
  if (isOpeningChangePasswordModal) {
    console.log('Ignorando clique global enquanto change-password-modal está abrindo');
    return;
  }
  if (changePasswordModal && changePasswordModalContent && changePasswordModal.style.display === 'flex') {
    setTimeout(() => {
      if (!changePasswordModalContent.contains(event.target) && !changePasswordBtn.contains(event.target)) {
        console.log('Fechando change-password-modal por clique fora');
        closeChangePasswordModal();
      }
    }, 0);
  }
});

window.onload = async function () {
  console.log('Executando window.onload em script.js');
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
      currentUser = {
        id: data.id,
        nome: data.nome,
        tipo: data.tipo,
      };
      console.log('Usuário autenticado:', currentUser);
      const mainContainer = document.querySelector('#main-container');
      const userName = document.querySelector('#user-name');
      const manageUsersBtn = document.querySelector('#manage-users-btn');
      console.log('Verificando elementos da interface:', {
        mainContainer: !!mainContainer,
        userName: !!userName,
        manageUsersBtn: !!manageUsersBtn,
      });
      if (!mainContainer) {
        console.error('Elemento main-container não encontrado');
        showModal('Erro: Interface principal não encontrada');
        window.location.href = 'index.php';
        return;
      }
      if (!userName) {
        console.error('Elemento user-name não encontrado');
        showModal('Erro: Nome do usuário não encontrado na interface');
        window.location.href = 'index.php';
        return;
      }
      mainContainer.style.display = 'block';
      userName.textContent = currentUser.nome;
      if (manageUsersBtn) {
        manageUsersBtn.style.display = currentUser.tipo === 'admin' ? 'block' : 'none';
      }
      await atualizarInterface();
      startLancheRefresh();
    } else {
      console.log('Sessão inválida, redirecionando para index.php');
      window.location.href = 'index.php';
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    showModal(`Erro ao carregar dados: ${error.message}`);
    window.location.href = 'index.php';
  }
};
