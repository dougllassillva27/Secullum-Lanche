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
