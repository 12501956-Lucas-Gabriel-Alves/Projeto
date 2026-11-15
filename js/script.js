// ===== script.js - Site KLG =====
// Usado por todas as páginas. No final do arquivo, cada página liga só o que ela tem.

// ---------- DADOS ----------
// Para mudar nome, descrição ou preço de um produto, edite só esta lista.
// As fotos ficam em img/produtos/ com o nome indicado em "imagem".
const produtos = [
  { id: 1, nome: "Frango Crocante", categoria: "frangos", preco: 12.90, imagem: "1.jpg",
    descricao: "Porção individual de frango empanado, crocante por fora e macio por dentro." },
  { id: 2, nome: "Balde de Frango - 6 pedaços", categoria: "frangos", preco: 39.90, imagem: "6.jpg",
    descricao: "Balde com 6 pedaços de frango crocante, ótimo para dividir." },
  { id: 3, nome: "Balde de Frango - 10 pedaços", categoria: "frangos", preco: 59.90, imagem: "4.jpg",
    descricao: "Balde com 10 pedaços de frango crocante para a turma toda." },
  { id: 4, nome: "Combo Individual", categoria: "combos", preco: 24.90, imagem: "2.jpg",
    descricao: "Frango crocante, batata frita e refrigerante." },
  { id: 5, nome: "Combo Duplo", categoria: "combos", preco: 44.90, imagem: "5.jpg",
    descricao: "Frango crocante, batata frita e dois refrigerantes." },
  { id: 6, nome: "Combo Família", categoria: "combos", preco: 79.90, imagem: "3.jpg",
    descricao: "Balde de frango, batata frita e refrigerante para a família toda." }
];

const idsDestaque = [3, 4, 6];   // produtos em destaque na página inicial
const TAXA_ENTREGA = 5;          // taxa de entrega fixa
const nomesStatus = ["Pedido recebido", "Em preparação", "Saiu para entrega", "Entregue"];

// ---------- FUNÇÕES AUXILIARES ----------

// LocalStorage: ler e salvar (o valor vira texto JSON)
function lerDados(chave, padrao) {
  return JSON.parse(localStorage.getItem(chave)) || padrao;
}

function salvarDados(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function apenasNumeros(texto) {
  return texto.replace(/\D/g, "");
}

// Tira acentos para a busca achar "familia" e "Família"
function semAcento(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// tipo = "erro" ou "sucesso"
function mostrarMensagem(id, texto, tipo) {
  var caixa = document.getElementById(id);
  caixa.textContent = texto;
  caixa.className = "mensagem " + tipo;
}

// Mostra (true) ou esconde (false) um elemento pelo id
function mostrar(id, visivel) {
  document.getElementById(id).classList.toggle("oculto", !visivel);
}

function buscarProduto(id) {
  for (var i = 0; i < produtos.length; i++) {
    if (produtos[i].id === id) {
      return produtos[i];
    }
  }
  return null;
}

// Devolve o usuário logado (ou null)
function usuarioLogado() {
  var id = Number(localStorage.getItem("klg_logado"));
  var usuarios = lerDados("klg_usuarios", []);
  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id === id) {
      return usuarios[i];
    }
  }
  return null;
}

// ---------- CABEÇALHO E TEMA ----------

function aplicarTema() {
  var escuro = localStorage.getItem("klg_tema") === "escuro";
  document.body.classList.toggle("escuro", escuro);
  document.getElementById("botao-tema").textContent = escuro ? "Modo claro" : "Modo escuro";
}

function atualizarContador() {
  var carrinho = lerDados("klg_carrinho", []);
  var total = 0;
  for (var i = 0; i < carrinho.length; i++) {
    total = total + carrinho[i].quantidade;
  }
  document.getElementById("contador-carrinho").textContent = total;
}

function configurarCabecalho() {
  aplicarTema();
  atualizarContador();

  // Botão de tema: troca e salva a escolha
  document.getElementById("botao-tema").addEventListener("click", function () {
    var escuro = document.body.classList.contains("escuro");
    localStorage.setItem("klg_tema", escuro ? "claro" : "escuro");
    aplicarTema();
  });

  // Botão ☰ do menu no celular
  document.getElementById("botao-menu").addEventListener("click", function () {
    document.getElementById("menu").classList.toggle("aberto");
  });

  // Com usuário logado, Login e Cadastro dão lugar ao Sair
  if (usuarioLogado() !== null) {
    mostrar("link-login", false);
    mostrar("link-cadastro", false);
    mostrar("link-sair", true);
  }

  document.getElementById("link-sair").addEventListener("click", function (evento) {
    evento.preventDefault();
    localStorage.removeItem("klg_logado");
    window.location.href = "index.html";
  });
}

// ---------- MÁSCARAS ----------

// Coloca os números no padrão. Ex.: "###.###.###-##"
function aplicarPadrao(valor, padrao) {
  var numeros = apenasNumeros(valor);
  var resultado = "";
  var posicao = 0;

  for (var i = 0; i < padrao.length && posicao < numeros.length; i++) {
    if (padrao[i] === "#") {
      resultado += numeros[posicao];
      posicao++;
    } else {
      resultado += padrao[i];
    }
  }
  return resultado;
}

// Todo campo com data-mascara="cpf", "telefone" ou "data" recebe a máscara
function aplicarMascaras() {
  var campos = document.querySelectorAll("input[data-mascara]");
  campos.forEach(function (campo) {
    campo.addEventListener("input", function () {
      var tipo = campo.dataset.mascara;
      var padrao = "##/##/####";

      if (tipo === "cpf") {
        padrao = "###.###.###-##";
      } else if (tipo === "telefone") {
        padrao = "(##) ####-####";
        if (apenasNumeros(campo.value).length > 10) {
          padrao = "(##) #####-####"; // celular com 11 números
        }
      }
      campo.value = aplicarPadrao(campo.value, padrao);
    });
  });
}

// ---------- VALIDAÇÃO ----------

// Confere se a data dd/mm/aaaa existe e não está no futuro
function dataValida(texto) {
  var dia = Number(texto.slice(0, 2));
  var mes = Number(texto.slice(3, 5));
  var ano = Number(texto.slice(6, 10));
  var data = new Date(ano, mes - 1, dia);

  return texto.length === 10 && ano >= 1900 && data <= new Date() &&
         data.getDate() === dia && data.getMonth() === mes - 1;
}

// Valida os dados. Devolve o texto do erro, ou "" se estiver tudo certo.
// idAtual = id de quem está editando o perfil (0 no cadastro novo).
function validarDados(dados, idAtual) {
  if (dados.nome === "" || dados.email === "" || dados.cpf === "" ||
      dados.telefone === "" || dados.nascimento === "") {
    return "Preencha todos os campos obrigatórios.";
  }
  if (dados.nome.length < 5 || dados.nome.indexOf(" ") === -1) {
    return "Digite seu nome completo.";
  }
  if (dados.email.indexOf("@") < 1 || dados.email.lastIndexOf(".") < dados.email.indexOf("@") + 2) {
    return "Digite um e-mail válido.";
  }
  if (apenasNumeros(dados.cpf).length !== 11) {
    return "O CPF deve ter 11 números.";
  }
  if (apenasNumeros(dados.telefone).length < 10) {
    return "Digite o telefone com DDD.";
  }
  if (!dataValida(dados.nascimento)) {
    return "Digite uma data de nascimento válida (dd/mm/aaaa).";
  }

  // E-mail e CPF não podem ser de outro usuário
  var usuarios = lerDados("klg_usuarios", []);
  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id !== idAtual && (usuarios[i].email === dados.email || usuarios[i].cpf === dados.cpf)) {
      return "E-mail ou CPF já cadastrado.";
    }
  }
  return "";
}

// ---------- PRODUTOS ----------

function criarCardProduto(produto) {
  var caminho = "img/produtos/" + produto.imagem;
  var card = document.createElement("div");
  card.className = "card-produto";

  // Sem a foto, o onerror esconde a imagem e aparece o aviso por trás
  card.innerHTML =
    '<div class="foto">' +
      '<span>Foto do produto<br><small>' + caminho + '</small></span>' +
      '<img src="' + caminho + '" alt="' + produto.nome + '" onerror="this.style.display=\'none\'">' +
    '</div>' +
    '<div class="card-info">' +
      '<h3>' + produto.nome + '</h3>' +
      '<p>' + produto.descricao + '</p>' +
      '<p class="preco">' + formatarPreco(produto.preco) + '</p>' +
      '<button class="botao botao-adicionar" data-id="' + produto.id + '">Adicionar ao carrinho</button>' +
    '</div>';

  // Botão "Adicionar ao carrinho"
  card.querySelector(".botao-adicionar").addEventListener("click", function () {
    adicionarAoCarrinho(produto.id);
  });
  return card;
}

// Página inicial
function mostrarDestaques() {
  var lista = document.getElementById("lista-destaques");
  for (var i = 0; i < idsDestaque.length; i++) {
    lista.appendChild(criarCardProduto(buscarProduto(idsDestaque[i])));
  }
}

// Página de produtos: mostra só os que combinam com a busca
function mostrarProdutos(filtro) {
  var busca = semAcento(filtro.toLowerCase().trim());
  var totalFrangos = 0;
  var totalCombos = 0;

  document.getElementById("lista-frangos").innerHTML = "";
  document.getElementById("lista-combos").innerHTML = "";

  for (var i = 0; i < produtos.length; i++) {
    var produto = produtos[i];

    if (semAcento(produto.nome.toLowerCase()).indexOf(busca) === -1) {
      continue; // não combina com a busca
    }

    if (produto.categoria === "frangos") {
      document.getElementById("lista-frangos").appendChild(criarCardProduto(produto));
      totalFrangos++;
    } else {
      document.getElementById("lista-combos").appendChild(criarCardProduto(produto));
      totalCombos++;
    }
  }

  // Esconde a categoria que ficou vazia
  mostrar("categoria-frangos", totalFrangos > 0);
  mostrar("categoria-combos", totalCombos > 0);
  mostrar("sem-resultado", totalFrangos + totalCombos === 0);
}

function iniciarProdutos() {
  var campoBusca = document.getElementById("campo-busca");
  mostrarProdutos("");
  campoBusca.addEventListener("input", function () {
    mostrarProdutos(campoBusca.value);
  });
}

// ---------- CARRINHO ----------

function adicionarAoCarrinho(id) {
  var carrinho = lerDados("klg_carrinho", []);
  var achou = false;

  for (var i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === id) {
      carrinho[i].quantidade++;
      achou = true;
    }
  }
  if (!achou) {
    carrinho.push({ id: id, quantidade: 1 });
  }

  salvarDados("klg_carrinho", carrinho);
  atualizarContador();
}

// acao = "aumentar", "diminuir" ou "remover"
function alterarCarrinho(id, acao) {
  var carrinho = lerDados("klg_carrinho", []);

  for (var i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === id) {
      if (acao === "aumentar") {
        carrinho[i].quantidade++;
      } else if (acao === "diminuir" && carrinho[i].quantidade > 1) {
        carrinho[i].quantidade--;
      } else if (acao === "remover") {
        carrinho.splice(i, 1);
      }
      break;
    }
  }

  salvarDados("klg_carrinho", carrinho);
  atualizarContador();
  mostrarCarrinho();
}

function mostrarCarrinho() {
  var lista = document.getElementById("lista-carrinho");
  var carrinho = lerDados("klg_carrinho", []);
  var subtotal = 0;

  lista.innerHTML = "";
  if (carrinho.length === 0) {
    lista.innerHTML = '<p class="vazio">Seu carrinho está vazio. <a href="produtos.html">Ver cardápio</a></p>';
  }

  for (var i = 0; i < carrinho.length; i++) {
    var produto = buscarProduto(carrinho[i].id);
    var totalItem = produto.preco * carrinho[i].quantidade;
    subtotal = subtotal + totalItem;

    var div = document.createElement("div");
    div.className = "item-carrinho";
    div.innerHTML =
      '<div class="item-info"><h3>' + produto.nome + '</h3><p>' + formatarPreco(produto.preco) + ' cada</p></div>' +
      '<div class="item-quantidade">' +
        '<button class="botao-qtd" data-id="' + produto.id + '" data-acao="diminuir">-</button>' +
        '<span>' + carrinho[i].quantidade + '</span>' +
        '<button class="botao-qtd" data-id="' + produto.id + '" data-acao="aumentar">+</button>' +
      '</div>' +
      '<div class="item-total">' + formatarPreco(totalItem) + '</div>' +
      '<button class="botao-remover" data-id="' + produto.id + '" data-acao="remover">Remover</button>';
    lista.appendChild(div);
  }

  // Valores do resumo
  var entrega = subtotal > 0 ? TAXA_ENTREGA : 0;
  document.getElementById("subtotal").textContent = formatarPreco(subtotal);
  document.getElementById("entrega").textContent = formatarPreco(entrega);
  document.getElementById("total").textContent = formatarPreco(subtotal + entrega);

  // Botões - + e Remover
  lista.querySelectorAll("button").forEach(function (botao) {
    botao.addEventListener("click", function () {
      alterarCarrinho(Number(botao.dataset.id), botao.dataset.acao);
    });
  });
}

function finalizarPedido() {
  var carrinho = lerDados("klg_carrinho", []);
  var usuario = usuarioLogado();

  if (carrinho.length === 0) {
    mostrarMensagem("mensagem-carrinho", "Seu carrinho está vazio.", "erro");
    return;
  }
  if (usuario === null) {
    mostrarMensagem("mensagem-carrinho", "Faça login para finalizar o pedido. Redirecionando...", "erro");
    setTimeout(function () {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  // A forma de pagamento precisa ser escolhida
  var forma = document.getElementById("forma-pagamento").value;
  if (forma === "") {
    mostrarMensagem("mensagem-carrinho", "Escolha a forma de pagamento.", "erro");
    return;
  }

  // Monta os itens e o total
  var itens = [];
  var total = TAXA_ENTREGA;
  for (var i = 0; i < carrinho.length; i++) {
    var produto = buscarProduto(carrinho[i].id);
    itens.push({ produtoId: produto.id, nome: produto.nome, quantidade: carrinho[i].quantidade, preco: produto.preco });
    total = total + produto.preco * carrinho[i].quantidade;
  }

  var pedidos = lerDados("klg_pedidos", []);
  pedidos.push({
    numero: pedidos.length + 1,
    usuarioId: usuario.id,
    itens: itens,
    formaPagamento: forma,
    entrega: TAXA_ENTREGA,
    total: total,
    data: new Date().toLocaleString("pt-BR"),
    momento: Date.now(),
    status: nomesStatus[0]
  });

  salvarDados("klg_pedidos", pedidos);
  salvarDados("klg_carrinho", []);
  window.location.href = "pedidos.html";
}

function iniciarCarrinho() {
  mostrarCarrinho();
  document.getElementById("botao-finalizar").addEventListener("click", finalizarPedido);
}

// ---------- PEDIDOS ----------

// Status simulado: muda a cada minuto desde que o pedido foi feito
function numeroDoStatus(pedido) {
  var minutos = Math.floor((Date.now() - pedido.momento) / 60000);
  return Math.min(minutos, 3);
}

function mostrarPedidos() {
  var lista = document.getElementById("lista-pedidos");
  var usuario = usuarioLogado();

  if (usuario === null) {
    lista.innerHTML = '<p class="vazio">Você precisa entrar para ver seus pedidos. <a href="login.html">Fazer login</a></p>';
    return;
  }

  var pedidos = lerDados("klg_pedidos", []);
  var html = "";

  // Do pedido mais novo para o mais antigo
  for (var i = pedidos.length - 1; i >= 0; i--) {
    var pedido = pedidos[i];
    if (pedido.usuarioId !== usuario.id) {
      continue; // pedido de outro usuário
    }

    var numeroStatus = numeroDoStatus(pedido);

    var itensHtml = "";
    for (var j = 0; j < pedido.itens.length; j++) {
      var item = pedido.itens[j];
      itensHtml += "<li>" + item.quantidade + "x " + item.nome + " - " + formatarPreco(item.preco * item.quantidade) + "</li>";
    }

    html +=
      '<div class="card-pedido">' +
        '<div class="pedido-topo">' +
          '<h3>Pedido nº ' + pedido.numero + '</h3>' +
          '<span class="status status-' + numeroStatus + '">' + nomesStatus[numeroStatus] + '</span>' +
        '</div>' +
        '<p>Data: ' + pedido.data + '</p>' +
        '<p>Pagamento: ' + pedido.formaPagamento + '</p>' +
        '<ul>' + itensHtml + '</ul>' +
        '<p class="pedido-total">Total (com entrega): ' + formatarPreco(pedido.total) + '</p>' +
      '</div>';
  }

  if (html === "") {
    html = '<p class="vazio">Você ainda não fez pedidos. <a href="produtos.html">Ver cardápio</a></p>';
  }
  lista.innerHTML = html;
}

// ---------- EXPORTAR PEDIDOS (JSON) ----------

// Coloca um zero na frente dos números menores que 10 (5 vira "05")
function doisDigitos(numero) {
  return numero < 10 ? "0" + numero : "" + numero;
}

// Transforma o momento do pedido em "2026-11-09 20:27:45" (formato do MySQL)
function dataParaBanco(momento) {
  var d = new Date(momento);
  return d.getFullYear() + "-" + doisDigitos(d.getMonth() + 1) + "-" + doisDigitos(d.getDate()) + " " +
         doisDigitos(d.getHours()) + ":" + doisDigitos(d.getMinutes()) + ":" + doisDigitos(d.getSeconds());
}

// Gera e baixa o arquivo pedidos.json, que o aplicativo C# importa para o banco
function exportarPedidos() {
  var pedidos = lerDados("klg_pedidos", []);
  var usuarios = lerDados("klg_usuarios", []);
  var lista = [];

  for (var i = 0; i < pedidos.length; i++) {
    var pedido = pedidos[i];

    // Procura os dados do cliente que fez o pedido
    var cliente = null;
    for (var j = 0; j < usuarios.length; j++) {
      if (usuarios[j].id === pedido.usuarioId) {
        cliente = usuarios[j];
      }
    }
    if (cliente === null) {
      continue;
    }

    lista.push({
      numero: pedido.numero,
      dataPedido: dataParaBanco(pedido.momento),
      status: nomesStatus[numeroDoStatus(pedido)],
      formaPagamento: pedido.formaPagamento,
      taxaEntrega: pedido.entrega,
      total: pedido.total,
      cliente: {
        nome: cliente.nome,
        email: cliente.email,
        cpf: cliente.cpf,
        telefone: cliente.telefone,
        // dd/mm/aaaa vira aaaa-mm-dd
        dataNascimento: cliente.nascimento.slice(6, 10) + "-" + cliente.nascimento.slice(3, 5) + "-" + cliente.nascimento.slice(0, 2)
      },
      itens: pedido.itens
    });
  }

  if (lista.length === 0) {
    mostrarMensagem("mensagem-pedidos", "Não há pedidos para exportar.", "erro");
    return;
  }

  // Cria o arquivo na memória e faz o navegador baixar
  var texto = JSON.stringify({ pedidos: lista }, null, 2);
  var arquivo = new Blob([texto], { type: "application/json" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = "pedidos.json";
  link.click();

  mostrarMensagem("mensagem-pedidos", lista.length + " pedido(s) exportado(s) em pedidos.json.", "sucesso");
}

// ---------- LOGIN E CADASTRO ----------

function configurarLogin() {

  // Cadastro
  document.getElementById("form-cadastro").addEventListener("submit", function (evento) {
    evento.preventDefault();

    var dados = {
      id: Date.now(),
      nome: document.getElementById("cad-nome").value.trim(),
      email: document.getElementById("cad-email").value.trim().toLowerCase(),
      cpf: document.getElementById("cad-cpf").value,
      telefone: document.getElementById("cad-telefone").value,
      nascimento: document.getElementById("cad-nascimento").value,
      senha: document.getElementById("cad-senha").value
    };
    var confirmar = document.getElementById("cad-confirmar").value;

    var erro = validarDados(dados, 0);
    if (erro === "") {
      if (dados.senha === "" || confirmar === "") {
        erro = "Preencha a senha e a confirmação de senha.";
      } else if (dados.senha.length < 6) {
        erro = "A senha deve ter pelo menos 6 caracteres.";
      } else if (dados.senha !== confirmar) {
        erro = "As senhas não são iguais.";
      }
    }

    if (erro !== "") {
      mostrarMensagem("mensagem-cadastro", erro, "erro");
      return;
    }

    // Simulação: a senha fica salva no LocalStorage
    var usuarios = lerDados("klg_usuarios", []);
    usuarios.push(dados);
    salvarDados("klg_usuarios", usuarios);

    this.reset();
    mostrarMensagem("mensagem-cadastro", "Cadastro realizado com sucesso! Agora faça o login.", "sucesso");
  });

  // Login
  document.getElementById("form-login").addEventListener("submit", function (evento) {
    evento.preventDefault();

    var email = document.getElementById("login-email").value.trim().toLowerCase();
    var senha = document.getElementById("login-senha").value;
    var usuarios = lerDados("klg_usuarios", []);

    if (email === "" || senha === "") {
      mostrarMensagem("mensagem-login", "Digite o e-mail e a senha.", "erro");
      return;
    }

    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].email === email && usuarios[i].senha === senha) {
        localStorage.setItem("klg_logado", usuarios[i].id);
        mostrarMensagem("mensagem-login", "Login realizado! Redirecionando...", "sucesso");
        setTimeout(function () {
          window.location.href = "produtos.html";
        }, 1000);
        return;
      }
    }
    mostrarMensagem("mensagem-login", "E-mail ou senha incorretos.", "erro");
  });
}

// ---------- PERFIL ----------

function mostrarPerfil() {
  var usuario = usuarioLogado();

  mostrar("aviso-perfil", usuario === null);
  mostrar("area-perfil", usuario !== null);
  if (usuario === null) {
    return;
  }

  mostrar("dados-perfil", true);
  mostrar("form-perfil", false);
  document.getElementById("perfil-nome").textContent = usuario.nome;
  document.getElementById("perfil-email").textContent = usuario.email;
  document.getElementById("perfil-cpf").textContent = usuario.cpf;
  document.getElementById("perfil-telefone").textContent = usuario.telefone;
  document.getElementById("perfil-nascimento").textContent = usuario.nascimento;
}

function iniciarPerfil() {
  mostrarPerfil();

  // Editar: preenche o formulário com os dados atuais
  document.getElementById("botao-editar").addEventListener("click", function () {
    var usuario = usuarioLogado();
    document.getElementById("edit-nome").value = usuario.nome;
    document.getElementById("edit-email").value = usuario.email;
    document.getElementById("edit-cpf").value = usuario.cpf;
    document.getElementById("edit-telefone").value = usuario.telefone;
    document.getElementById("edit-nascimento").value = usuario.nascimento;

    mostrar("dados-perfil", false);
    mostrar("form-perfil", true);
    document.getElementById("mensagem-perfil").className = "mensagem";
  });

  document.getElementById("botao-cancelar").addEventListener("click", mostrarPerfil);

  // Salvar alterações
  document.getElementById("form-perfil").addEventListener("submit", function (evento) {
    evento.preventDefault();

    var usuario = usuarioLogado();
    var dados = {
      nome: document.getElementById("edit-nome").value.trim(),
      email: document.getElementById("edit-email").value.trim().toLowerCase(),
      cpf: document.getElementById("edit-cpf").value,
      telefone: document.getElementById("edit-telefone").value,
      nascimento: document.getElementById("edit-nascimento").value
    };

    var erro = validarDados(dados, usuario.id);
    if (erro !== "") {
      mostrarMensagem("mensagem-perfil", erro, "erro");
      return;
    }

    // Copia os dados novos para o usuário (a senha e o id continuam iguais)
    var usuarios = lerDados("klg_usuarios", []);
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].id === usuario.id) {
        for (var campo in dados) {
          usuarios[i][campo] = dados[campo];
        }
      }
    }
    salvarDados("klg_usuarios", usuarios);

    mostrarPerfil();
    mostrarMensagem("mensagem-perfil", "Dados salvos com sucesso!", "sucesso");
  });
}

// ---------- INÍCIO: cada página liga só o que ela tem ----------

configurarCabecalho();
aplicarMascaras();

if (document.getElementById("lista-destaques")) {
  mostrarDestaques();
}
if (document.getElementById("lista-frangos")) {
  iniciarProdutos();
}
if (document.getElementById("form-cadastro")) {
  configurarLogin();
}
if (document.getElementById("lista-carrinho")) {
  iniciarCarrinho();
}
if (document.getElementById("lista-pedidos")) {
  mostrarPedidos();
  document.getElementById("botao-exportar").addEventListener("click", exportarPedidos);
}
if (document.getElementById("area-perfil")) {
  iniciarPerfil();
}