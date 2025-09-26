const apiUrl = "https://crudcrud.com/api/67a7dc4203bd434aaf4a5c8806115423"
let data = [];


// Renderização dinâmica da main
const getTemplate = (pagina) => {
  const main = document.getElementById("conteudo-principal");
  fetch(`templates/${pagina}.html`)
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao carregar o conteúdo");
      return response.text();
    })
    .then((html) => {
      main.innerHTML = html;
      if (pagina === "calcular") {
        getIMC();
      } else if (pagina === "classificacao") {
        getData();
      } else if (pagina === "dicas") {
        const enviarBtn = document.getElementById("enviar-mensagem");
        if (enviarBtn) enviarBtn.addEventListener("click", postMensagem);
      } else if (pagina === "mensagens") {
        getMensagens();
      }
    })
    .catch(
      (error) => (main.innerHTML = `<p>Erro ao carregar a página: ${error}</p>`)
    );
};

//Capturando o array de objetos data.json
const getData = async () => {
  try {
    const response = await fetch("./data.json");
    if (response.ok) {
      data = await response.json();
      console.log("getdata");

      generateCards();
    } else {
      throw new Error("Erro ao buscar os dados");
    }
  } catch (error) {
    console.error(error);
  }
};

//Calcular IMC
const getIMC = () => {
  const btnCalcular = document.getElementById("calcular-btn");
  const modalBody = document.getElementById("modal-body-imc");
  const modalElement = document.getElementById("exampleModalCenter");
  const modalIMC = new bootstrap.Modal(modalElement);
  const formIMC = document.getElementById("imc-formulario");

  btnCalcular.addEventListener("click", (e) => {
    if (formIMC.checkValidity()) {
      const inputNome = document.getElementById("inputNome").value;
      const inputIdade = document.getElementById("inputIdade").value;
      const inputPeso = Number(
        document.getElementById("inputPeso").value.replace(",", ".")
      );
      const inputAltura = Number(
        document.getElementById("inputAltura").value.replace(/[.,]/g, "")
      );
      const alturaEmMetros = inputAltura / 100;
      const imcResultado = Number(
        (inputPeso / (alturaEmMetros * alturaEmMetros)).toFixed(2)
      );

      modalBody.innerHTML = `
    <p>Nome: ${inputNome}</p>
      <p>Idade: ${inputIdade} anos</p>
      <p>Peso: ${inputPeso} kg</p>
      <p>Altura: ${inputAltura} cm</p>
      <p><strong>IMC: ${imcResultado}</strong></p>  
    `;
      modalIMC.show();
    } else {
      formIMC.reportValidity();
    }
  });
};

// Renderizar Cards de classificação
const generateCards = () => {
  const cardContainer = document.getElementById("cards-container");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  data.map((item, index) => {
    const card = `
      <div class="card" style="width: 18rem;">
        <img src="${item.imagem}" class="card-img-top" alt="${item.titulo}">
        <div class="card-body">
          <h5 class="card-title">${item.titulo}</h5>
          <p class="card-text">${item.classificacao}</p>
          <button 
            type="button" 
            class="btn btn-primary ver-btn" 
            data-index="${index}"
          >
            Ver
          </button>
        </div>
      </div>
    `;
    cardContainer.innerHTML += card;
  });

  // Adiciona listener a todos os botões
  document.querySelectorAll(".ver-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.currentTarget.getAttribute("data-index");
      const item = data[index];

      const modalBody = document.querySelector(
        "#exampleModalCenter .modal-body"
      );
      const modalTitle = document.querySelector(
        "#exampleModalCenter .modal-title"
      );

      modalTitle.textContent = item.titulo;
      modalBody.innerHTML = `
        <div class="card">
          <img src="${item.imagem}" class="card-img-top" alt="${item.titulo}">
          <div class="card-body">
            <h5 class="card-title">${item.titulo}</h5>
            <p class="card-text">${item.classificacao}</p>
            <p class="card-text">${item.texto}</p>
          </div>
        </div>
      `;

      // Abre a modal
      const modal = new bootstrap.Modal(
        document.getElementById("exampleModalCenter")
      );
      modal.show();
    });
  });
};

//Guardando as mensagens
const postMensagem = async () => {
  const inputNomeMensagem = document.getElementById("mensagem-nome").value;
  const inputAssuntoMensagem =
    document.getElementById("mensagem-assunto").value;
  const inputTextoMensagem = document.getElementById("mensagem-texto").value;
  const modalMenssagem = document.getElementById("exampleModal");

  const novaMensagem = {
    nome: inputNomeMensagem,
    assunto: inputAssuntoMensagem,
    mensagem: inputTextoMensagem,
    favorito:false,
    data: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${apiUrl}/mensagens`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaMensagem),
      }
    );
    if (response.ok) {
      console.log("Mensagem enviada com sucesso!");
      const modal = bootstrap.Modal.getInstance(modalMenssagem);
      modal.hide();
    }
  } catch (error) {
    console.error(error);
  }
};

//Capturando a lista de mensagens da api
const getMensagens = async () => {
  try {
    const response = await fetch(`${apiUrl}/mensagens`);
    if (response.ok) {
      data = await response.json();
      console.log(data);

      generateMensagensCards();
    } else {
      throw new Error("Erro ao buscar os dados");
    }
  } catch (error) {
    console.error(error);
  }
};

// Renderizar Cards de Mensagens
const generateMensagensCards = () => {
  const cardContainer = document.getElementById("cards-container-mensagens");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  data.map((item) => {
    const card = `
      <div class="card h-100 border-primary mb-3" style="max-width: 18rem;">
        <div class="card-header d-flex justify-content-between align-items-center">
          ${item.nome}
          <i class="btn-fav bi ${item.favorito ? "bi-star-fill text-warning" : "bi-star"}" 
            data-id="${item._id}" 
            style="cursor:pointer;">
          </i>
        </div>
        <div class="card-body">
          <h5 class="card-title">${item.assunto}</h5>
          <p class="card-text">${item.mensagem}</p>
        </div>
        <div class="d-flex justify-content-end p-2">
        <a href="#" class="btn-delete" data-id="${item._id}">
        <i class="bi bi-trash-fill text-danger"></i>
        </a>
        </div>
      </div>
      
    `;
    cardContainer.innerHTML += card;
  });

 // adicionando um listener de clique
  cardContainer.addEventListener("click", async (e) => {
    const target = e.target; // pega o elemento exato que foi clicado pelo usuário.

    // Deletando uma mensagem:
    // target.closest(".btn-delete")  procura o elemento mais próximo acima na hierarquia do DOM que tenha a classe "btn-delete"
    if (target.closest(".btn-delete")) { 
      e.preventDefault();
      const id = target.closest(".btn-delete").getAttribute("data-id");
      const cardElement = target.closest(".card");

      try {
        const response = await fetch(`${apiUrl}/mensagens/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          console.log("Mensagem excluída!");
          cardElement.remove();
          // Remove do array local
          data = data.filter((msg) => msg._id !== id);
        }
      } catch (error) {
        console.error("Erro de rede:", error);
      }
    }

    // Favoritando uma mensagem
    // target.classList.contains("btn-fav"): Verifica se o elemento clicado (target) tem a classe "btn-fav"
    if (target.classList.contains("btn-fav")) {
      const starIcon = target;
      const id = starIcon.getAttribute("data-id");
      const isFavorito = starIcon.classList.contains("bi-star-fill");
      // procura a mensagem na lista 'data' pelo id
      const mensagem = data.find((msg) => msg._id === id);
      // desconstroi o objeto mensagem para enviar para api sem o id
      const { _id, ...novaMensagem } = mensagem;

      try {
        const response = await fetch(`${apiUrl}/mensagens/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...novaMensagem, favorito: !isFavorito }),
          //envia a mensagem atualizada com o campo favorito invertico com o 'isFavorito
        });

        if (response.ok) {
          console.log("Mensagem atualizada!");
          // Atualiza ícone na tela
          isFavorito ? starIcon.className = "btn-fav bi-star" : starIcon.className = "btn-fav bi-star-fill text-warning";
          // Atualiza array local
          mensagem.favorito = !isFavorito;
        }
      } catch (error) {
        console.error("Erro de rede:", error);
      }
    }
  });

};
