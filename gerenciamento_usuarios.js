document.addEventListener('DOMContentLoaded', function () {
  console.log('gerenciamento_usuarios.js carregado');
  loadUsers();

  // Adicionar eventos de clique para fechar modais ao clicar fora
  document.getElementById('user-modal').addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
      closeUserModal();
    }
  });
  document.getElementById('password-modal').addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
      closePasswordModal();
    }
  });
  document.getElementById('delete-modal').addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
      closeDeleteModal();
    }
  });
  document.getElementById('message-modal').addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
      closeMessageModal();
    }
  });
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadUsers() {
  console.log('Iniciando loadUsers');
  try {
    const userList = document.getElementById('user-list');
    if (!userList) {
      console.error('Erro: Elemento #user-list não encontrado');
      showMessageModal('Erro: Não foi possível carregar a lista de usuários.');
      return;
    }

    const response = await fetch('api.php?action=list_users');
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }
    const usuarios = await response.json();
    console.log('Resposta da API:', usuarios);

    if (Array.isArray(usuarios)) {
      userList.innerHTML = '';
      if (usuarios.length === 0) {
        userList.innerHTML = '<p class="status-text">Nenhum usuário encontrado.</p>';
        return;
      }
      usuarios.forEach((user) => {
        console.log('Processando usuário:', { id: user.id, nome: user.nome, tipo: user.tipo });
        const card = document.createElement('div');
        card.className = 'user-box';
        const escapedNome = escapeHtml(user.nome);
        const tipoMap = {
          admin: 'Administrador',
          especialista: 'Especialista',
          user: 'Usuário',
        };
        const tipoNormalizado = (user.tipo || 'user').toLowerCase();
        const tipoTexto = tipoMap[tipoNormalizado] || 'Usuário';
        console.log(`Usuário ${user.nome}: tipo=${tipoNormalizado}, exibido=${tipoTexto}`);
        card.innerHTML = `
          <h3>${escapedNome}</h3>
          <p>Tipo: ${tipoTexto}</p>
          <button class="action-btn edit" onclick="openEditModal(${user.id}, '${escapedNome.replace(/'/g, "\\'")}', '${tipoNormalizado}')"><i class="fas fa-edit"></i> Editar</button>
          <button class="action-btn password" onclick="openPasswordModal(${user.id})"><i class="fas fa-key"></i> Alterar Senha</button>
          <button class="action-btn delete" onclick="openDeleteModal(${user.id}, '${escapedNome.replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i> Excluir</button>
        `;
        userList.appendChild(card);
      });
      console.log('Cards renderizados:', userList.children.length);
    } else {
      console.error('Resposta inválida:', usuarios);
      showMessageModal('Erro ao carregar usuários: ' + (usuarios.error || 'Resposta inválida'));
    }
  } catch (error) {
    console.error('Erro em loadUsers:', error);
    showMessageModal('Erro ao carregar usuários: ' + error.message);
  }
}

function showMessageModal(message) {
  console.log('Exibindo mensagem:', message);
  const modal = document.getElementById('message-modal');
  const modalMessage = document.getElementById('modal-message');
  if (modal && modalMessage) {
    modalMessage.textContent = message;
    modal.style.display = 'flex';
  } else {
    console.error('Modal de mensagem não encontrado');
    alert('Erro: ' + message);
  }
}

function closeMessageModal() {
  const modal = document.getElementById('message-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function openUserModal(title, id = '', nome = '', tipo = 'user', isEditMode = false) {
  console.log('Abrindo user modal:', { title, id, nome, tipo, isEditMode });
  const modal = document.getElementById('user-modal');
  const modalTitle = document.getElementById('user-modal-title');
  const userId = document.getElementById('user-id');
  const userName = document.getElementById('user-nome');
  const userPassword = document.getElementById('user-senha');
  const userType = document.getElementById('user-tipo');
  const passwordInputGroup = document.querySelector('.password-form-group');

  if (!modal || !modalTitle || !userId || !userName || !userType || !passwordInputGroup) {
    console.error('Erro: Elementos do modal de usuário não encontrados');
    showMessageModal('Erro: Não foi possível abrir o formulário.');
    return;
  }

  modalTitle.textContent = title;
  userId.value = id;
  userName.value = nome;
  userType.value = tipo;

  if (isEditMode) {
    passwordInputGroup.style.display = 'none';
    if (userPassword) {
      userPassword.disabled = true;
      userPassword.required = false;
      userPassword.value = '';
    }
  } else {
    passwordInputGroup.style.display = 'block';
    if (userPassword) {
      userPassword.disabled = false;
      userPassword.required = true;
      userPassword.value = '';
    }
  }

  modal.style.display = 'flex';
}

function closeUserModal() {
  const modal = document.getElementById('user-modal');
  const form = document.getElementById('user-form');
  const passwordInputGroup = document.querySelector('.password-form-group');
  if (modal && form) {
    modal.style.display = 'none';
    form.reset();
    if (passwordInputGroup) {
      passwordInputGroup.style.display = 'block';
    }
  }
}

function openEditModal(id, nome, tipo) {
  openUserModal('Editar Usuário', id, nome, tipo, true);
}

function addUser() {
  openUserModal('Adicionar Usuário');
}

function openPasswordModal(id) {
  console.log('Abrindo modal de senha para ID:', id);
  const modal = document.getElementById('password-modal');
  const userId = document.getElementById('password-user-id');
  const newPassword = document.getElementById('new-password');
  if (!modal || !userId || !newPassword) {
    console.error('Erro: Elementos do modal de senha não encontrados');
    showMessageModal('Erro: Não foi possível abrir o formulário de senha.');
    return;
  }
  userId.value = id;
  newPassword.value = '';
  modal.style.display = 'flex';
}

function closePasswordModal() {
  const modal = document.getElementById('password-modal');
  const form = document.getElementById('password-form');
  if (modal && form) {
    modal.style.display = 'none';
    form.reset();
  }
}

function openDeleteModal(id, nome) {
  console.log('Abrindo modal de exclusão para ID:', id, 'Nome:', nome);
  const modal = document.getElementById('delete-modal');
  const userId = document.getElementById('delete-user-id');
  const userName = document.getElementById('delete-user-name');
  if (!modal || !userId || !userName) {
    console.error('Erro: Elementos do modal de exclusão não encontrados');
    showMessageModal('Erro: Não foi possível abrir a confirmação de exclusão.');
    return;
  }
  userId.value = id;
  userName.textContent = nome;
  modal.style.display = 'flex';
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function confirmDelete() {
  const id = document.getElementById('delete-user-id').value;
  console.log('Confirmando exclusão para ID:', id);
  try {
    const response = await fetch('api.php?action=delete_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${encodeURIComponent(id)}`,
    });
    const data = await response.json();
    console.log('Resposta da exclusão:', data);
    if (data.success) {
      showMessageModal('Usuário excluído com sucesso!');
      closeDeleteModal();
      await loadUsers();
    } else {
      showMessageModal('Erro ao excluir usuário: ' + (data.error || 'Falha desconhecida'));
    }
  } catch (error) {
    console.error('Erro ao excluir:', error);
    showMessageModal('Erro ao excluir usuário: ' + error.message);
  }
}

document.addEventListener('submit', async function (event) {
  event.preventDefault();
  if (event.target.id === 'user-form') {
    const id = document.getElementById('user-id').value;
    const nome = document.getElementById('user-nome').value.trim();
    const senha = document.getElementById('user-senha').value;
    const tipo = document.getElementById('user-tipo').value;
    const action = id ? 'edit_user' : 'add_user';
    console.log('Enviando user-form:', { id, nome, tipo, action });

    try {
      const body = id ? `id=${encodeURIComponent(id)}&nome=${encodeURIComponent(nome)}&tipo=${encodeURIComponent(tipo)}` : `nome=${encodeURIComponent(nome)}&senha=${encodeURIComponent(senha)}&tipo=${encodeURIComponent(tipo)}`;
      const response = await fetch(`api.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const data = await response.json();
      console.log('Resposta do user-form:', data);
      if (data.success) {
        showMessageModal(id ? 'Usuário atualizado com sucesso!' : 'Usuário adicionado com sucesso!');
        closeUserModal();
        await loadUsers();
      } else {
        showMessageModal('Erro: ' + (data.error || 'Falha desconhecida'));
      }
    } catch (error) {
      console.error('Erro no user-form:', error);
      showMessageModal('Erro: ' + error.message);
    }
  } else if (event.target.id === 'password-form') {
    const id = document.getElementById('password-user-id').value;
    const senha = document.getElementById('new-password').value.trim();
    console.log('Enviando password-form:', { id, senha: senha ? '[senha presente]' : '[senha vazia]' });

    if (!id || !senha) {
      showMessageModal('Erro: ID e senha são obrigatórios');
      return;
    }

    try {
      const response = await fetch('api.php?action=change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${encodeURIComponent(id)}&senha=${encodeURIComponent(senha)}`,
      });
      const data = await response.json();
      console.log('Resposta do password-form:', data);
      if (data.success) {
        showMessageModal('Senha alterada com sucesso!');
        closePasswordModal();
      } else {
        showMessageModal('Erro ao alterar senha: ' + (data.error || 'Falha desconhecida'));
      }
    } catch (error) {
      console.error('Erro no password-form:', error);
      showMessageModal('Erro ao alterar senha: ' + error.message);
    }
  }
});
