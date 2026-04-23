const API_URL = 'http://localhost:3000/produtos';
const modal = document.getElementById('modalProduto');
const form = document.getElementById('formProduto');
let listaProdutos = []; 

document.addEventListener('DOMContentLoaded', carregarProdutos);


async function carregarProdutos() {
    const res = await fetch(API_URL);
    listaProdutos = await res.json();
    renderizarTabela(listaProdutos);
    atualizarCards(listaProdutos);
}

function renderizarTabela(produtos) {
    const tbody = document.getElementById('tabelaProdutos');
    tbody.innerHTML = '';

    produtos.forEach(p => {
        const isLow = p.estoque <= p.estoque_min;
        tbody.innerHTML += `
            <tr>
                <td>#${p.id}</td>
                <td><strong>${p.nome}</strong><br><small style="color: #666;">${p.descricao || ''}</small></td>
                <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                <td>${p.estoque} un.</td>
                <td>
                    <span class="badge ${isLow ? 'badge-low' : 'badge-ok'}">
                        ${isLow ? 'Abaixo do Mínimo' : 'Normal'}
                    </span>
                </td>
                <td>
                    <button class="btn-action edit" onclick='abrirModalEditar(${JSON.stringify(p)})'>Editar</button>
                    <button class="btn-action delete" onclick="eliminarProduto(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function atualizarCards(produtos) {
    document.getElementById('total-count').innerText = produtos.length;
    const valorTotal = produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0);
    document.getElementById('total-value').innerText = `R$ ${valorTotal.toFixed(2)}`;
    const alertas = produtos.filter(p => p.estoque <= p.estoque_min).length;
    document.getElementById('alert-count').innerText = alertas;
}


document.getElementById('searchInput').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = listaProdutos.filter(p => p.nome.toLowerCase().includes(termo));
    renderizarTabela(filtrados);
});


function abrirModalNovo() {
    form.reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('modalTitle').innerText = 'Novo Produto';
    modal.style.display = 'flex';
}

function abrirModalEditar(produto) {
    document.getElementById('produtoId').value = produto.id;
    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('estoque').value = produto.estoque;
    document.getElementById('estoqueMin').value = produto.estoque_min;
    
    document.getElementById('modalTitle').innerText = 'Editar Produto';
    modal.style.display = 'flex';
}

function fecharModal() { modal.style.display = 'none'; }


form.onsubmit = async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('produtoId').value;
    const dados = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        preco: document.getElementById('preco').value,
        estoque: document.getElementById('estoque').value,
        estoque_min: document.getElementById('estoqueMin').value
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    fecharModal();
    carregarProdutos();
};

async function eliminarProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        carregarProdutos();
    }
}

window.onclick = (e) => { if (e.target == modal) fecharModal(); };