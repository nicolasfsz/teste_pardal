const API_URL = 'http://localhost:3000';
const modal = document.getElementById('modalMov');
const form = document.getElementById('formMovimentacao');

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    document.getElementById('movData').valueAsDate = new Date();
});

// ── Carregamento ────────────────────────────────────────────────────────────

async function carregarDados() {
    const [produtos, movimentacoes] = await Promise.all([
        fetch(`${API_URL}/produtos`).then(r => r.json()),
        fetch(`${API_URL}/movimentacoes`).then(r => r.json())
    ]);

    renderizarAlertas(produtos);
    renderizarStatusProdutos(produtos);
    renderizarHistorico(movimentacoes);
    preencherSelectProdutos(produtos);
}

// ── Alertas ─────────────────────────────────────────────────────────────────

function renderizarAlertas(produtos) {
    const alertBox = document.getElementById('alertBox');
    const alertMessages = document.getElementById('alertMessages');
    const criticos = produtos.filter(p => p.estoque <= p.estoque_min);

    if (criticos.length === 0) {
        alertBox.style.display = 'none';
        return;
    }

    alertBox.style.display = 'block';
    alertMessages.innerHTML = criticos
        .map(p => `<div>"${p.nome}" está abaixo do mínimo (${p.estoque}/${p.estoque_min})</div>`)
        .join('');
}

// ── Tabela de Status (Bubble Sort alfabético) ────────────────────────────────

function bubbleSortAlfabetico(arr) {
    const lista = [...arr];
    for (let i = 0; i < lista.length - 1; i++) {
        for (let j = 0; j < lista.length - 1 - i; j++) {
            if (lista[j].nome.localeCompare(lista[j + 1].nome) > 0) {
                [lista[j], lista[j + 1]] = [lista[j + 1], lista[j]];
            }
        }
    }
    return lista;
}

function renderizarStatusProdutos(produtos) {
    const tbody = document.getElementById('tabelaStatus');
    const ordenados = bubbleSortAlfabetico(produtos);

    tbody.innerHTML = ordenados.map(p => {
        const isLow = p.estoque <= p.estoque_min;
        return `
            <tr>
                <td>#${p.id}</td>
                <td><strong>${p.nome}</strong></td>
                <td>${p.estoque} un.</td>
                <td>${p.estoque_min} un.</td>
                <td>
                    <span class="badge ${isLow ? 'badge-low' : 'badge-ok'}">
                        ${isLow ? 'Abaixo do Mínimo' : 'Normal'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ── Histórico ────────────────────────────────────────────────────────────────

function renderizarHistorico(movimentacoes) {
    const tbody = document.getElementById('tabelaHistorico');

    if (movimentacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888;">Nenhuma movimentação registrada.</td></tr>';
        return;
    }

    tbody.innerHTML = movimentacoes.map(m => {
        const isEntrada = m.tipo === 'Entrada';
        const dataFormatada = new Date(m.data_registro + 'T00:00:00').toLocaleDateString('pt-BR');
        return `
            <tr>
                <td>${dataFormatada}</td>
                <td><strong>${m.produto_nome}</strong></td>
                <td><span class="badge-${isEntrada ? 'entrada' : 'saida'}">${m.tipo}</span></td>
                <td>${m.quantidade} un.</td>
            </tr>
        `;
    }).join('');
}

// ── Select de Produtos no Modal ───────────────────────────────────────────────

function preencherSelectProdutos(produtos) {
    const select = document.getElementById('movProduto');
    const ordenados = bubbleSortAlfabetico(produtos);
    select.innerHTML = '<option value="">Selecione um produto...</option>' +
        ordenados.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
}

// ── Modal ────────────────────────────────────────────────────────────────────

function abrirModalMovimentacao() {
    form.reset();
    document.getElementById('movData').valueAsDate = new Date();
    modal.style.display = 'flex';
}

function fecharModal() {
    modal.style.display = 'none';
}

window.onclick = (e) => {
    if (e.target === modal) fecharModal();
};

// ── Submit ───────────────────────────────────────────────────────────────────

form.onsubmit = async (e) => {
    e.preventDefault();

    const dados = {
        produto_id: document.getElementById('movProduto').value,
        tipo: document.getElementById('movTipo').value,
        quantidade: parseInt(document.getElementById('movQtd').value),
        data_registro: document.getElementById('movData').value
    };

    try {
        const res = await fetch(`${API_URL}/movimentacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!res.ok) throw new Error('Erro ao registrar movimentação');

        fecharModal();
        carregarDados();
    } catch (err) {
        alert('Erro ao registrar movimentação. Verifique o servidor.');
        console.error(err);
    }
};