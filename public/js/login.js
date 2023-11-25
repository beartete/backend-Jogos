// Constante contendo a URL base para as requisições ao backend
const urlBase = 'http://localhost:4000/api';

// Função para lidar com o cadastro de filmes
document.getElementById("cadastroFilmeForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Coletando os dados do formulário de cadastro de filmes
    const title = document.getElementById("title").value;
    const director = document.getElementById("director").value;
    const year = document.getElementById("year").value;
    const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"));

    // Dados do novo filme a ser cadastrado
    const novoFilme = {
        title: title,
        director: director,
        year: year
    };

    // Fazer a solicitação POST para o endpoint de cadastro de filmes
    fetch(`${urlBase}/filme/cadastro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(novoFilme)
    })
    .then(response => response.json())
    .then(data => {
        // Verificar se o filme foi cadastrado com sucesso
        if (data.message === "Filme cadastrado com sucesso") {
            // Feedback para o usuário sobre o cadastro bem-sucedido
            document.getElementById("mensagem").innerHTML = `<span class='text-success'>Filme cadastrado com sucesso!</span>`;
            resultadoModal.show();
            // Redirecionar o usuário para a página desejada após o cadastro (opcional)
            setTimeout(() => {
                // Código para redirecionar o usuário (exemplo: window.location.href = "outrapagina.html";)
            }, 2000); // Redirecionar após 2 segundos (opcional, ajuste conforme necessário)
        } else if (data.errors) {
            // Caso haja erros na resposta da API durante o cadastro
            const errorMessages = data.errors.map(error => error.msg).join("\n");
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Falha no cadastro:\n${errorMessages}</span>`;
            resultadoModal.show();
        } else {
            // Mensagem genérica de falha no cadastro
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Não foi possível realizar o cadastro do filme.</span>`;
            resultadoModal.show();
        }
    })
    .catch(error => {
        console.error("Erro durante o cadastro do filme:", error);
    });
});
