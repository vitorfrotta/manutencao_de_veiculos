/* ===================================================
   FleetCare – App Logic
   =================================================== */

// ── STATE ──────────────────────────────────────────
let manutencoes = JSON.parse(localStorage.getItem('fc_manutencoes') || '[]');
let veiculos    = JSON.parse(localStorage.getItem('fc_veiculos')    || '[]');

// ── SEED DATA (demo) ───────────────────────────────
if (!manutencoes.length && !veiculos.length) {
  veiculos = [
    { id: uid(), modelo: 'Fiat Strada 1.3', placa: 'ABC-1234', ano: '2021', cor: 'Branco', setor: 'Logística', resp: 'Carlos Oliveira' },
    { id: uid(), modelo: 'VW Gol 1.0',      placa: 'DEF-5678', ano: '2019', cor: 'Prata',  setor: 'Comercial',  resp: 'Ana Paula' },
    { id: uid(), modelo: 'Ford Ka 1.5',      placa: 'GHI-9012', ano: '2022', cor: 'Preto',  setor: 'Diretoria',  resp: 'Roberto Melo' },
  ];
  manutencoes = [
    { id: uid(), veiculoId: veiculos[0].id, data: '2024-05-10', tipo: 'Troca de Óleo',  custo: 280,   oficina: 'AutoCenter Silva',  km: '42000', status: 'Concluído',    desc: 'Troca de óleo e filtro.' },
    { id: uid(), veiculoId: veiculos[1].id, data: '2024-04-22', tipo: 'Revisão',        custo: 650,   oficina: 'VW Autorizada',      km: '38500', status: 'Concluído',    desc: 'Revisão de 40.000 km.' },
    { id: uid(), veiculoId: veiculos[2].id, data: '2024-05-18', tipo: 'Freios',         custo: 920,   oficina: 'Mecânica Rápida',    km: '21000', status: 'Concluído',    desc: 'Troca de pastilhas e discos dianteiros.' },
    { id: uid(), veiculoId: veiculos[0].id, data: '2024-03-05', tipo: 'Pneus',          custo: 1480,  oficina: 'Pneutop',            km: '40000', status: 'Concluído',    desc: 'Quatro pneus novos.' },
    { id: uid(), veiculoId: veiculos[1].id, data: '2024-05-25', tipo: 'Elétrica',       custo: 340,   oficina: 'Eletro Car',         km: '39200', status: 'Em andamento', desc: 'Problema no alternador.' },
    { id: uid(), veiculoId: veiculos[2].id, data: '2024-06-10', tipo: 'Preventiva',     custo: 500,   oficina: 'AutoCenter Silva',   km: '',      status: 'Agendado',     desc: 'Revisão preventiva agendada.' },
  ];
  save();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function save() {
  localStorage.setItem('fc_manutencoes', JSON.stringify(manutencoes));
  localStorage.setItem('fc_veiculos',    JSON.stringify(veiculos));
}

// ── NAVIGATION ─────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  const idx = ['dashboard','registros','veiculos'].indexOf(id);
  if (btns[idx]) btns[idx].classList.add('active');

  if (id === 'dashboard') renderDashboard();
  if (id === 'registros') renderTable();
  if (id === 'veiculos')  renderVeiculos();
}

// ── HELPERS ────────────────────────────────────────
function getVeiculo(id) { return veiculos.find(v => v.id === id) || {}; }

function formatCurrency(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(str) {
  if (!str) return '–';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function statusBadge(status) {
  const map = { 'Concluído': 'badge-success', 'Em andamento': 'badge-warning', 'Agendado': 'badge-info' };
  const cls = map[status] || 'badge-petrol';
  return `<span class="badge ${cls}">${status}</span>`;
}

function tipoColor(tipo) {
  const colors = {
    'Preventiva':'#1a7a8a','Corretiva':'#dc2626','Revisão':'#2563eb',
    'Troca de Óleo':'#16a34a','Pneus':'#d97706','Freios':'#9333ea',
    'Elétrica':'#f0a500','Outro':'#64748b'
  };
  return colors[tipo] || '#64748b';
}

// ── DASHBOARD ──────────────────────────────────────
function renderDashboard() {
  // KPIs
  const total    = manutencoes.length;
  const custoSum = manutencoes.reduce((a, m) => a + Number(m.custo || 0), 0);
  const hoje     = new Date();
  const mes      = manutencoes.filter(m => {
    if (!m.data) return false;
    const d = new Date(m.data);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }).length;

  document.getElementById('kpi-total').textContent    = total;
  document.getElementById('kpi-custo').textContent    = formatCurrency(custoSum);
  document.getElementById('kpi-mes').textContent      = mes;
  document.getElementById('kpi-veiculos').textContent = veiculos.length;

  // Chart – custo por tipo
  const tipoMap = {};
  manutencoes.forEach(m => {
    tipoMap[m.tipo] = (tipoMap[m.tipo] || 0) + Number(m.custo || 0);
  });
  const sorted = Object.entries(tipoMap).sort((a,b) => b[1]-a[1]);
  const max    = sorted[0]?.[1] || 1;
  const chartEl = document.getElementById('chartTipos');
  if (!sorted.length) {
    chartEl.innerHTML = '<p class="chart-empty">Nenhum dado disponível</p>';
  } else {
    chartEl.innerHTML = sorted.map(([tipo, val]) => `
      <div class="chart-bar-row">
        <span class="chart-bar-label">${tipo}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${(val/max*100).toFixed(1)}%; background:linear-gradient(90deg,${tipoColor(tipo)}99,${tipoColor(tipo)})"></div>
        </div>
        <span class="chart-bar-value">${formatCurrency(val)}</span>
      </div>
    `).join('');
  }

  // Últimas manutenções
  const ultimas = [...manutencoes].sort((a,b) => b.data?.localeCompare(a.data||'')||0).slice(0, 6);
  const ulEl = document.getElementById('ultimasManutencoes');
  if (!ultimas.length) {
    ulEl.innerHTML = '<p class="chart-empty">Nenhum registro ainda</p>';
  } else {
    ulEl.innerHTML = ultimas.map(m => {
      const v = getVeiculo(m.veiculoId);
      return `
        <div class="manut-item">
          <div class="manut-dot" style="background:${tipoColor(m.tipo)}"></div>
          <div class="manut-info">
            <div class="manut-veiculo">${v.modelo || '–'} <span style="font-weight:400;color:var(--text-light)">${v.placa||''}</span></div>
            <div class="manut-tipo">${m.tipo}</div>
          </div>
          <div>
            <div class="manut-custo">${formatCurrency(m.custo)}</div>
            <div class="manut-data">${formatDate(m.data)}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ── TABLE ──────────────────────────────────────────
function renderTable() {
  const filterTipo   = document.getElementById('filterTipo').value;
  const filterSearch = document.getElementById('filterSearch').value.toLowerCase();

  let list = manutencoes.filter(m => {
    const v = getVeiculo(m.veiculoId);
    const matchTipo   = !filterTipo   || m.tipo === filterTipo;
    const matchSearch = !filterSearch || 
      (v.modelo||'').toLowerCase().includes(filterSearch) ||
      (v.placa||'').toLowerCase().includes(filterSearch)  ||
      (m.tipo||'').toLowerCase().includes(filterSearch)   ||
      (m.oficina||'').toLowerCase().includes(filterSearch);
    return matchTipo && matchSearch;
  }).sort((a,b) => (b.data||'').localeCompare(a.data||''));

  const tbody   = document.getElementById('tableBody');
  const emptyEl = document.getElementById('emptyState');

  if (!list.length) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  tbody.innerHTML = list.map((m, i) => {
    const v = getVeiculo(m.veiculoId);
    const origIdx = manutencoes.indexOf(m);
    return `
      <tr>
        <td>${formatDate(m.data)}</td>
        <td><strong>${v.modelo || '–'}</strong></td>
        <td><span style="font-family:monospace;font-size:12px;background:var(--petrol-pale);color:var(--petrol);padding:3px 8px;border-radius:4px;font-weight:700">${v.placa || '–'}</span></td>
        <td><span style="color:${tipoColor(m.tipo)};font-weight:600">${m.tipo}</span></td>
        <td>${m.oficina || '–'}</td>
        <td><strong>${formatCurrency(m.custo)}</strong></td>
        <td>${statusBadge(m.status)}</td>
        <td>
          <div class="td-actions">
            <button class="btn-icon btn-edit" onclick="editManutencao(${origIdx})" title="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon btn-delete" onclick="deleteManutencao(${origIdx})" title="Excluir">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── VEHICLES ───────────────────────────────────────
function renderVeiculos() {
  const grid    = document.getElementById('veiculosGrid');
  const emptyEl = document.getElementById('emptyVeiculos');

  if (!veiculos.length) {
    grid.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  grid.innerHTML = veiculos.map((v, i) => {
    const count = manutencoes.filter(m => m.veiculoId === v.id).length;
    const custo = manutencoes
      .filter(m => m.veiculoId === v.id)
      .reduce((a, m) => a + Number(m.custo || 0), 0);
    return `
      <div class="veiculo-card">
        <div class="veiculo-card-header">
          <div class="veiculo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <button class="btn-icon btn-delete" onclick="deleteVeiculo(${i})" title="Remover veículo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
        <div class="veiculo-modelo">${v.modelo}</div>
        <span class="veiculo-placa">${v.placa}</span>
        <div class="veiculo-meta">
          <div class="veiculo-meta-item">
            <span class="veiculo-meta-label">Ano</span>
            <span class="veiculo-meta-value">${v.ano || '–'}</span>
          </div>
          <div class="veiculo-meta-item">
            <span class="veiculo-meta-label">Cor</span>
            <span class="veiculo-meta-value">${v.cor || '–'}</span>
          </div>
          <div class="veiculo-meta-item">
            <span class="veiculo-meta-label">Setor</span>
            <span class="veiculo-meta-value">${v.setor || '–'}</span>
          </div>
          <div class="veiculo-meta-item">
            <span class="veiculo-meta-label">Responsável</span>
            <span class="veiculo-meta-value">${v.resp || '–'}</span>
          </div>
        </div>
        <div class="veiculo-manut-count">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          ${count} manutenção(ões) · ${formatCurrency(custo)} total
        </div>
        <div class="veiculo-card-actions">
          <button class="btn-secondary" style="font-size:12px;padding:6px 12px" onclick="newManutForVeiculo('${v.id}')">
            + Registrar Manutenção
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ── MODAL MANUTENÇÃO ───────────────────────────────
function openModal(editIdx = -1) {
  populateVeiculoSelect();
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');

  document.getElementById('editIndex').value = editIdx;
  document.getElementById('modalTitle').textContent = editIdx >= 0 ? 'Editar Manutenção' : 'Nova Manutenção';

  if (editIdx >= 0) {
    const m = manutencoes[editIdx];
    document.getElementById('formVeiculo').value = m.veiculoId || '';
    document.getElementById('formData').value    = m.data     || '';
    document.getElementById('formTipo').value    = m.tipo     || '';
    document.getElementById('formCusto').value   = m.custo    || '';
    document.getElementById('formOficina').value = m.oficina  || '';
    document.getElementById('formKm').value      = m.km       || '';
    document.getElementById('formStatus').value  = m.status   || 'Concluído';
    document.getElementById('formDesc').value    = m.desc     || '';
  } else {
    document.getElementById('formVeiculo').value = '';
    document.getElementById('formData').value    = new Date().toISOString().slice(0,10);
    document.getElementById('formTipo').value    = '';
    document.getElementById('formCusto').value   = '';
    document.getElementById('formOficina').value = '';
    document.getElementById('formKm').value      = '';
    document.getElementById('formStatus').value  = 'Concluído';
    document.getElementById('formDesc').value    = '';
  }
}

function newManutForVeiculo(veiculoId) {
  showSection('registros');
  setTimeout(() => {
    openModal();
    document.getElementById('formVeiculo').value = veiculoId;
  }, 50);
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
}

function populateVeiculoSelect() {
  const sel = document.getElementById('formVeiculo');
  sel.innerHTML = '<option value="">Selecione um veículo</option>' +
    veiculos.map(v => `<option value="${v.id}">${v.modelo} – ${v.placa}</option>`).join('');
}

function saveManutencao() {
  const veiculoId = document.getElementById('formVeiculo').value;
  const data      = document.getElementById('formData').value;
  const tipo      = document.getElementById('formTipo').value;
  const custo     = document.getElementById('formCusto').value;

  if (!veiculoId || !data || !tipo || custo === '') {
    showToast('⚠️ Preencha os campos obrigatórios.');
    return;
  }

  const registro = {
    id:        uid(),
    veiculoId,
    data,
    tipo,
    custo:   Number(custo),
    oficina: document.getElementById('formOficina').value,
    km:      document.getElementById('formKm').value,
    status:  document.getElementById('formStatus').value,
    desc:    document.getElementById('formDesc').value,
  };

  const editIdx = parseInt(document.getElementById('editIndex').value);
  if (editIdx >= 0) {
    registro.id = manutencoes[editIdx].id;
    manutencoes[editIdx] = registro;
    showToast('✅ Manutenção atualizada!');
  } else {
    manutencoes.push(registro);
    showToast('✅ Manutenção registrada!');
  }

  save();
  document.getElementById('modalOverlay').classList.remove('open');
  renderDashboard();
  renderTable();
}

function editManutencao(idx) { openModal(idx); }

function deleteManutencao(idx) {
  if (!confirm('Deseja excluir este registro?')) return;
  manutencoes.splice(idx, 1);
  save();
  renderTable();
  renderDashboard();
  showToast('🗑️ Registro removido.');
}

// ── MODAL VEÍCULO ──────────────────────────────────
function openVeiculoModal() {
  document.getElementById('veiculoModalOverlay').classList.add('open');
  ['vFormModelo','vFormPlaca','vFormAno','vFormCor','vFormSetor','vFormResp'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function closeVeiculoModal(e) {
  if (e && e.target !== document.getElementById('veiculoModalOverlay')) return;
  document.getElementById('veiculoModalOverlay').classList.remove('open');
}

function saveVeiculo() {
  const modelo = document.getElementById('vFormModelo').value.trim();
  const placa  = document.getElementById('vFormPlaca').value.trim();
  if (!modelo || !placa) {
    showToast('⚠️ Modelo e Placa são obrigatórios.');
    return;
  }
  veiculos.push({
    id:    uid(),
    modelo,
    placa: placa.toUpperCase(),
    ano:   document.getElementById('vFormAno').value,
    cor:   document.getElementById('vFormCor').value,
    setor: document.getElementById('vFormSetor').value,
    resp:  document.getElementById('vFormResp').value,
  });
  save();
  document.getElementById('veiculoModalOverlay').classList.remove('open');
  renderVeiculos();
  renderDashboard();
  showToast('🚗 Veículo cadastrado!');
}

function deleteVeiculo(idx) {
  const v = veiculos[idx];
  const count = manutencoes.filter(m => m.veiculoId === v.id).length;
  const msg = count > 0
    ? `Este veículo possui ${count} registro(s) de manutenção. Deseja excluir mesmo assim?`
    : 'Deseja excluir este veículo?';
  if (!confirm(msg)) return;
  manutencoes = manutencoes.filter(m => m.veiculoId !== v.id);
  veiculos.splice(idx, 1);
  save();
  renderVeiculos();
  renderDashboard();
  showToast('🗑️ Veículo removido.');
}

// ── TOAST ──────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── INIT ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Date badge
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
  // Close modals on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('modalOverlay').classList.remove('open');
      document.getElementById('veiculoModalOverlay').classList.remove('open');
    }
  });
  renderDashboard();
});
