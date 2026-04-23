/**
 * vitrine.js — Carrega e renderiza produtos na vitrine
 * Responsável: Dev 1
 */

// TODO: implementar carregarVitrine() 
// TODO: implementar filtro por categoria
// TODO: implementar paginação
// TODO: implementar busca por título



let paginaAtual = 1;
const limit = 8;
let categoriaAtual = null;
let buscaAtual = '';


const produtosGrid = document.getElementById('produtos-grid');
const btnAnterior = document.getElementById('btn-anterior');
const btnProxima = document.getElementById('btn-proximma');
const paginaSpan = document.getElementById('pagina-span');
const buscaInput = document.getElementById('busca-input');
const btnBuscar = document.getElementById('btn-buscar');


async function carregarVitrine() {
    try {
        produtosGrid.innerHTML = '<div class="loading">Carregando...</div>';

        const offset = (paginaAtual - 1) * limit;


        const filtros = {
            offset: offset,
            limit: limit
        };

        if (categoriaAtual) filtros.categoryId = categoriaAtual;
        if (buscaAtual) filtros.title = buscaAtual;

        const produtos = await buscarProdutos(filtros);

        
        exibirProdutos(produtos);

        atualizarPaginação();

    } catch (erro) {
        produtosGrid.innerHTML = '<div class="erro"> Erro ao carregar produtos</div>';
        return;
    }

    produtosGrid.innerHTML = "";

    produtosGrid.forEach(produto => {
        const card = document.createElement('article');
        card.className = 'card-produto';

        const imagem = produto.images?.[0] || 'https://picsum.photos/300/200?random=${produtos.grid.id}';
        const categoria = produto.category?.name || 'PRODUTO';


         card.innerHTML = `
            <img src="${imagem}" class="imagem-produto">
            <div class="info-produto">
                <div class="categoria-produto">${categoria}</div>
                <h3 class="titulo-produto">${produto.title}</h3>
                <div class="preco-produto">R$ ${produto.price.toFixed(2)}</div>
                <button class="btn-comprar">Comprar</button>
            </div>
        `;

        card.querySelector('.btn-comprar').onclick = () => alert ('🛒 ${produto} adicionado');
        produtosGrid.appendChild(card);
    });
}


async function filtroPorCategoria(categoryId) {
    categoriaAtual = categoryId;
    paginaAtual = 1;
    await carregarVitrine();
}

async function carregarCategoria() {
    const selectCategoria = document.getElementById('seleção-categoria');
    if (!selectCategoria) return;

    try {
        const categorias = await buscaCategorias();

        selectCategoria.innerHTML = '<option value="">Todas categorias</option>';

        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            selectCategoria.appendChild(option);
        });
    
    } catch (erro) {
        selectCategoria.innerHTML = '<option value="">Categorias indisponiveis</option>';
    }
}




function proximaPagina() {
    paginaAtual++;
    carregarVitrine();
    window.scrollTo({ top: 0, behavior: 'smooth'});
}


function anteriorPagina() {
    if (paginaAtual > 1) {
        paginaAtual--;
        window.scrollTo({ top: 0, behavior: 'smooth'});
    }
}

function atualizarPaginação() {
    if (paginaSpan) {
        paginaSpan.textContent = 'Página ${paginaAtual}';
    }

    if (btnAnterior) {
        btnAnterior.disabled = paginaAtual === 1;
    }
}


function buscarPorTitulo() {
    buscaAtual = buscaInput?.value.trim()|| '';
    paginaAtual = 1;
    carregarVitrine();
}
