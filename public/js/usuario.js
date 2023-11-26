//const urlBase = 'https://backend-mongodb-pi.vercel.app/api';
const urlBase = 'http://localhost:4001/api';
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"));
const access_token = localStorage.getItem("token") || null;

//evento submit do formulário
document.getElementById('formUsuario').addEventListener('submit', function (event) {
    event.preventDefault(); // evita o recarregamento

    const idUsuario = document.getElementById('id').value;
    let usuario = {
        "nome": document.getElementById('nome').value,
        "email": document.getElementById('email').value,
        "senha": document.getElementById('senha').value,
        "idade": document.getElementById('idade').value,
        "genero": document.querySelector('input[name="genero"]:checked').value,
        "ativo": true,
        "tipo": "tipo_de_usuario"
    };

    if (idUsuario.length > 0) { //Se possuir o ID, enviamos junto com o objeto
        usuario["_id"] = idUsuario;
    }

    salvaUsuario(usuario);
});

async function salvaUsuario(usuario) {
    let method = usuario.hasOwnProperty('_id') ? "PUT" : "POST";
    let endpoint = usuario.hasOwnProperty('_id') ? `${urlBase}/usuarios` : `${urlBase}/usuarios/${usuario._id}`;

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (response.ok) {
            if (data.acknowledged) {
                const message = usuario.hasOwnProperty('_id') ? 'Usuário alterado com sucesso!' : 'Usuário incluído com sucesso!';
                alert(message);
                document.getElementById('formUsuario').reset();
                carregaUsuarios();
            }
        } else {
            if (data.errors) {
                const errorMessages = data.errors.map(error => error.msg).join("\n");
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${errorMessages}</span>`;
                resultadoModal.show();
            } else {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`;
                resultadoModal.show();
            }
        }
    } catch (error) {
        document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o usuário: ${error.message}</span>`;
        resultadoModal.show();
    }
}

async function carregaUsuarios() {
    const tabela = document.getElementById('dadosTabela');
    tabela.innerHTML = ''; //Limpa a tabela antes de recarregar

    try {
        const response = await fetch(`${urlBase}/usuarios`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            }
        });

        const data = await response.json();

        if (response.ok) {
            data.forEach(usuario => {
                tabela.innerHTML += `
                <tr>
                    <td>${usuario.nome}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.idade}</td>
                    <td>${usuario.genero}</td>
                    <td>
                        <button class='btn btn-danger btn-sm' onclick='removeUsuario("${usuario._id}")'>🗑 Excluir </button>
                        <button class='btn btn-warning btn-sm' onclick='buscaUsuarioPeloId("${usuario._id}")'>📝 Editar </button>
                    </td>
                </tr>
                `;
            });
        } else {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao carregar os usuários</span>`;
            resultadoModal.show();
        }
    } catch (error) {
        document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao carregar os usuários: ${error.message}</span>`;
        resultadoModal.show();
    }
}

async function removeUsuario(id) {
    if (confirm('Deseja realmente excluir o usuário?')) {
        try {
            const response = await fetch(`${urlBase}/usuarios/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "access-token": access_token //envia o token na requisição
                }
            });

            const data = await response.json();

            if (response.ok && data.deletedCount > 0) {
                carregaUsuarios(); // atualiza a UI
            }
        } catch (error) {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao remover o usuário: ${error.message}</span>`;
            resultadoModal.show();
        }
    }
}

async function buscaUsuarioPeloId(id) {
    try {
        const response = await fetch(`${urlBase}/usuarios/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token //envia o token na requisição
            }
        });

        const data = await response.json();

        if (response.ok && data[0]) {
            document.getElementById('id').value = data[0]._id;
            document.getElementById('nome').value = data[0].nome;
            document.getElementById('email').value = data[0].email;
            document.getElementById('senha').value = data[0].senha;
            document.getElementById('idade').value = data[0].idade;
            document.getElementById(data[0].genero).checked = true;
        }
    } catch (error) {
        document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao buscar o usuário: ${error.message}</span>`;
        resultadoModal.show();
    }
}

// Chamar a função para carregar os usuários ao carregar a página
window.onload = function () {
    carregaUsuarios();
};
