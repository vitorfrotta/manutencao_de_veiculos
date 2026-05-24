/* ===================================================
   FleetCare – Auth Logic
   =================================================== */

// ── TOAST ──────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── TOGGLE SENHA VISÍVEL ───────────────────────────
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.classList.toggle('active', show);
  btn.innerHTML = show
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
       </svg>`;
}

// ── FORÇA DA SENHA ─────────────────────────────────
function checkSenhaForte() {
  const senhaEl = document.getElementById('cadSenha');
  const el      = document.getElementById('senhaForte');
  const fill    = document.getElementById('senhaBarraFill');
  const label   = document.getElementById('senhaLabel');
  if (!senhaEl || !el) return;
  const senha = senhaEl.value || '';
  if (!senha) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  let score = 0;
  if (senha.length >= 6)             score++;
  if (senha.length >= 10)            score++;
  if (/[A-Z]/.test(senha))           score++;
  if (/[0-9]/.test(senha))           score++;
  if (/[^A-Za-z0-9]/.test(senha))    score++;
  const niveis = [
    { label: 'Muito fraca', color: '#ef4444', w: '20%'  },
    { label: 'Fraca',       color: '#f97316', w: '40%'  },
    { label: 'Razoável',    color: '#eab308', w: '60%'  },
    { label: 'Forte',       color: '#22c55e', w: '80%'  },
    { label: 'Muito forte', color: '#16a34a', w: '100%' },
  ];
  const n = niveis[Math.min(score - 1, 4)] || niveis[0];
  fill.style.width      = n.w;
  fill.style.background = n.color;
  label.textContent     = n.label;
  label.style.color     = n.color;
}

// ── ERRO ───────────────────────────────────────────
function showErro(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent   = msg;
  el.style.display = 'block';
}
function hideErro(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ── USUÁRIOS ───────────────────────────────────────
function getUsuarios() {
  return JSON.parse(localStorage.getItem('fc_usuarios') || '[]');
}
function saveUsuarios(users) {
  localStorage.setItem('fc_usuarios', JSON.stringify(users));
}
function garantirAdmin() {
  const users = getUsuarios();
  if (!users.length) {
    users.push({ nome: 'Administrador', usuario: 'admin', email: '', senha: 'admin123' });
    saveUsuarios(users);
  }
  return getUsuarios();
}

// ── LOGIN ──────────────────────────────────────────
function entrar() {
  hideErro('loginErro');
  const usuario = (document.getElementById('loginUsuario').value || '').trim();
  const senha   =  document.getElementById('loginSenha').value   || '';
  if (!usuario || !senha) {
    showErro('loginErro', '⚠️ Preencha o usuário e a senha.');
    return;
  }
  const usuarios  = garantirAdmin();
  const encontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (!encontrado) {
    showErro('loginErro', '❌ Usuário ou senha incorretos.');
    const el = document.getElementById('loginSenha');
    el.classList.add('error');
    setTimeout(() => el.classList.remove('error'), 1500);
    return;
  }
  sessionStorage.setItem('fc_logado', JSON.stringify({ nome: encontrado.nome, usuario: encontrado.usuario }));
  showToast('✅ Bem-vindo, ' + encontrado.nome.split(' ')[0] + '!');
  setTimeout(() => { window.location.href = 'index.html'; }, 700);
}

// ── CADASTRAR ──────────────────────────────────────
function cadastrar() {
  hideErro('cadErro');
  const nome     = (document.getElementById('cadNome').value    || '').trim();
  const usuario  = (document.getElementById('cadUsuario').value || '').trim();
  const senha    =  document.getElementById('cadSenha').value   || '';
  const confirma =  document.getElementById('cadConfirma').value || '';
  if (!nome)    { showErro('cadErro', '⚠️ Informe seu nome completo.');      document.getElementById('cadNome').focus();    return; }
  if (!usuario) { showErro('cadErro', '⚠️ Escolha um nome de usuário.');     document.getElementById('cadUsuario').focus(); return; }
  if (/\s/.test(usuario)) { showErro('cadErro', '⚠️ O usuário não pode conter espaços.'); document.getElementById('cadUsuario').focus(); return; }
  if (!senha || senha.length < 6) { showErro('cadErro', '⚠️ A senha deve ter pelo menos 6 caracteres.'); document.getElementById('cadSenha').focus(); return; }
  if (senha !== confirma) {
    showErro('cadErro', '❌ As senhas não coincidem.');
    const el = document.getElementById('cadConfirma');
    el.classList.add('error');
    setTimeout(() => el.classList.remove('error'), 1500);
    return;
  }
  const usuarios = garantirAdmin();
  if (usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase())) {
    showErro('cadErro', '❌ Este usuário já está em uso. Escolha outro.');
    document.getElementById('cadUsuario').focus();
    return;
  }
  const email = (document.getElementById('cadEmail')?.value || '').trim();
  usuarios.push({ nome, usuario, email, senha });
  saveUsuarios(usuarios);
  showToast('✅ Conta criada! Redirecionando...');
  setTimeout(() => { window.location.href = 'login.html'; }, 1400);
}

// ── NAVEGAÇÃO ──────────────────────────────────────
function irParaCadastro() { window.location.href = 'cadastro.html'; }
function voltar()          { window.location.href = 'login.html';   }

// ── PROTEÇÃO DE ROTA ───────────────────────────────
// Só protege index.html quando acessado via servidor HTTP (não file://)
(function verificarSessao() {
  const proto   = window.location.protocol;
  const pagina  = window.location.pathname;
  const emIndex = pagina.endsWith('index.html') || pagina.endsWith('/') || pagina === '';
  if (emIndex && proto !== 'file:') {
    const logado = sessionStorage.getItem('fc_logado');
    if (!logado) {
      window.location.href = 'login.html';
    }
  }
})();

// ── ENTER NOS CAMPOS ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const loginUsuario = document.getElementById('loginUsuario');
  const loginSenha   = document.getElementById('loginSenha');
  const cadConfirma  = document.getElementById('cadConfirma');
  if (loginUsuario) loginUsuario.addEventListener('keydown', e => { if (e.key === 'Enter') loginSenha?.focus(); });
  if (loginSenha)   loginSenha.addEventListener('keydown',   e => { if (e.key === 'Enter') entrar(); });
  if (cadConfirma)  cadConfirma.addEventListener('keydown',  e => { if (e.key === 'Enter') cadastrar(); });
});
