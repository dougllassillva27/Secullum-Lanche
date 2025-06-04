let currentUser = null;
let currentFilter = { inicio: null, fim: null, duration: 'all', users: [] };
let allUsers = [];

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

async function logout() {
  try {
    const response = await fetch('api.php?action=logout');
    if (!response.ok) {
      throw new Error(`Erro ao fazer logout: HTTP ${response.status}`);
    }
    currentUser = null;
    window.location.href = 'index.php';
  } catch (error) {
    showModal(`Erro ao sair: ${error.message}`);
  }
}

async function loadUsers() {
  try {
    const response = await fetch('api.php?action=list_users');
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }
    const users = await response.json();
    allUsers = users;
    const userCheckboxes = document.getElementById('user-checkboxes');
    if (!userCheckboxes) {
      showModal('Erro: Não foi possível carregar a lista de usuários.');
      return;
    }
    userCheckboxes.innerHTML = '<label class="select-all"><input type="checkbox" id="select-all-users"> Selecionar todos</label>';
    if (users.length === 0) {
      userCheckboxes.innerHTML += '<p>Nenhum usuário encontrado.</p>';
      return;
    }
    users.forEach((user) => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" value="${user.id}"> ${user.nome} (${user.tipo})`;
      userCheckboxes.appendChild(label);
    });
    currentFilter.users = [];

    document.querySelectorAll('#user-checkboxes input[type="checkbox"]:not(#select-all-users)').forEach((checkbox) => {
      checkbox.addEventListener('change', function () {
        currentFilter.users = Array.from(document.querySelectorAll('#user-checkboxes input[type="checkbox"]:not(#select-all-users):checked')).map((cb) => parseInt(cb.value));
        updateSelectAllCheckbox();
        updateFilterButtonState();
      });
    });

    const selectAllCheckbox = document.getElementById('select-all-users');
    selectAllCheckbox.addEventListener('change', function () {
      const allCheckboxes = document.querySelectorAll('#user-checkboxes input[type="checkbox"]:not(#select-all-users)');
      const isChecked = selectAllCheckbox.checked;
      allCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      currentFilter.users = isChecked ? users.map((user) => user.id) : [];
      updateFilterButtonState();
    });
  } catch (error) {
    showModal('Erro ao carregar usuários: ' + error.message);
  }
}

function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById('select-all-users');
  const allCheckboxes = document.querySelectorAll('#user-checkboxes input[type="checkbox"]:not(#select-all-users)');
  const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);
  const noneChecked = Array.from(allCheckboxes).every((cb) => !cb.checked);
  if (allChecked) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else if (noneChecked) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.indeterminate = true;
  }
}

function updateFilterButtonState() {
  const filterButton = document.getElementById('filter-button');
  const filterInicio = document.getElementById('filter-data-inicio').value;
  const filterFim = document.getElementById('filter-data-fim').value;
  const selectedUsers = currentFilter.users.length;
  if (filterButton) {
    filterButton.disabled = !(filterInicio && filterFim && selectedUsers > 0);
  }
}

function getTurno(inicio) {
  try {
    const date = new Date(inicio);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    if (time >= '08:00:00' && time <= '12:00:00') return 'Manhã';
    if (time >= '13:00:00' && time <= '18:00:00') return 'Tarde';
    return 'Outro';
  } catch (error) {
    return 'Outro';
  }
}

async function filtrarRelatorio(explicit = false) {
  const filterInicio = document.getElementById('filter-data-inicio');
  const filterFim = document.getElementById('filter-data-fim');
  const filterDuration = document.getElementById('filter-duration');
  const gerarPdfBtn = document.getElementById('gerar-pdf');
  if (!filterInicio || !filterFim || !filterDuration || !gerarPdfBtn) {
    showModal('Erro: Campos de filtro não encontrados.');
    return;
  }
  currentFilter.inicio = filterInicio.value;
  currentFilter.fim = filterFim.value;
  currentFilter.duration = filterDuration.value;

  if (explicit && (!currentFilter.inicio || !currentFilter.fim || currentFilter.users.length === 0)) {
    showModal('Por favor, preencha ambas as datas e selecione pelo menos um usuário para filtrar.');
    gerarPdfBtn.disabled = true;
    return;
  }

  try {
    const formData = new FormData();
    if (currentFilter.inicio) formData.append('data_inicio', currentFilter.inicio);
    if (currentFilter.fim) formData.append('data_fim', currentFilter.fim);
    formData.append('limit', '1000');

    const histResponse = await fetch('api.php?action=history', {
      method: 'POST',
      body: formData,
    });
    if (!histResponse.ok) {
      const errorData = await histResponse.json();
      throw new Error(`Erro HTTP ${histResponse.status}: ${errorData.error || 'Erro desconhecido'}`);
    }

    let history = await histResponse.json();
    if (currentFilter.duration === 'above15') {
      history = history.filter((log) => {
        if (!log.fim) return false;
        const inicio = new Date(log.inicio);
        const fim = new Date(log.fim);
        const totalMinutos = (fim - inicio) / 60000;
        return totalMinutos > 15;
      });
    }
    if (currentFilter.users.length > 0) {
      history = history.filter((log) => currentFilter.users.includes(parseInt(log.usuario)));
    }

    const reportPreview = document.getElementById('report-preview');
    if (reportPreview) {
      if (history.length === 0) {
        reportPreview.innerHTML = '<p>Nenhum registro encontrado para os filtros selecionados.</p>';
      } else {
        const now = new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        let filtroTexto = 'Sem filtro de data';
        if (currentFilter.inicio && currentFilter.fim) {
          filtroTexto = `De ${currentFilter.inicio.split('-').reverse().join('/')} até ${currentFilter.fim.split('-').reverse().join('/')}`;
        } else if (currentFilter.inicio) {
          filtroTexto = `A partir de ${currentFilter.inicio.split('-').reverse().join('/')}`;
        } else if (currentFilter.fim) {
          filtroTexto = `Até ${currentFilter.fim.split('-').reverse().join('/')}`;
        }
        reportPreview.innerHTML = `
          <h2>Relatório de Lanches</h2>
          sbagli
          <div class="report-meta">
            <span>Gerado em: ${now}</span>
            <span>Filtro: ${filtroTexto}</span>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Tipo</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Duração</th>
                <th>Turno</th>
              </tr>
            </thead>
            <tbody>
              ${history
                .map((log, index) => {
                  const fim = log.fim ? formatarData(log.fim) : 'Sem horário fim';
                  const duracao = log.fim ? formatarDuracaoHistorico(null, log.inicio, log.fim) : 'Indisponível';
                  const tipo = allUsers.find((u) => u.id === parseInt(log.usuario))?.tipo || 'Desconhecido';
                  const turno = getTurno(log.inicio);
                  return `
                    <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                      <td>${log.nome || 'Desconhecido'}</td>
                      <td>${tipo}</td>
                      <td>${formatarData(log.inicio)}</td>
                      <td>${fim}</td>
                      <td>${duracao}</td>
                      <td>${turno}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6">Total de registros: ${history.length}</td>
              </tr>
            </tfoot>
          </table>
        `;
        gerarPdfBtn.disabled = false;
      }
    }
  } catch (error) {
    showModal(`Erro ao carregar relatório: ${error.message}`);
    gerarPdfBtn.disabled = true;
  }
}

async function gerarRelatorio() {
  if (!currentFilter.inicio || !currentFilter.fim || currentFilter.users.length === 0) {
    showModal('Por favor, preencha ambas as datas e selecione pelo menos um usuário para gerar o relatório.');
    return;
  }
  try {
    let url = 'api.php?action=report';
    const params = new URLSearchParams();
    if (currentFilter.inicio) params.append('data_inicio', currentFilter.inicio);
    if (currentFilter.fim) params.append('data_fim', currentFilter.fim);
    if (currentFilter.users.length > 0) params.append('users', currentFilter.users.join(','));
    if (currentFilter.duration === 'above15') params.append('duration', 'above15');
    url += `&${params.toString()}`;
    window.open(url, '_blank');
  } catch (error) {
    showModal(`Erro ao gerar relatório: ${error.message}`);
  }
}

function formatarDuracaoHistorico(duracao, inicio, fim) {
  try {
    if (!fim) return 'Indisponível';
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    if (isNaN(dataInicio) || isNaN(dataFim)) return 'Indisponível';
    const diffMs = dataFim - dataInicio;
    const totalMinutos = Math.floor(diffMs / 60000);
    const totalSegundos = Math.floor((diffMs % 60000) / 1000);
    return `${totalMinutos}m ${totalSegundos}s`;
  } catch (error) {
    return 'Indisponível';
  }
}

function formatarData(data) {
  try {
    if (!data) return 'Sem horário fim';
    const date = new Date(data);
    if (isNaN(date)) return 'Sem horário fim';
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    return 'Sem horário fim';
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
      currentUser = {
        id: data.id,
        nome: data.nome,
        tipo: data.tipo,
      };
      const mainContainer = document.querySelector('#main-container');
      const userName = document.querySelector('#user-nome');
      if (mainContainer && userName) {
        mainContainer.style.display = 'block';
        userName.textContent = currentUser.nome;
        await loadUsers();
        const dateInputs = [document.getElementById('filter-data-inicio'), document.getElementById('filter-data-fim')];
        dateInputs.forEach((input) => {
          if (input) {
            input.addEventListener('click', () => {
              try {
                input.showPicker();
              } catch (e) {}
            });
            input.addEventListener('input', updateFilterButtonState);
          }
        });
        updateFilterButtonState();
      } else {
        showModal('Erro: Elementos da interface não encontrados');
      }
    } else {
      window.location.href = 'index.php';
    }
  } catch (error) {
    showModal(`Erro ao carregar dados: ${error.message}`);
    window.location.href = 'index.php';
  }
};
