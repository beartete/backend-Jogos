const urlBase = 'http://localhost:4001/api'; // Altere para o seu endpoint correto
const resultadoModal = new bootstrap.Modal(document.getElementById('modalMensagem'));
const access_token = localStorage.getItem('token') || null;

// Evento submit do formulário
document.getElementById('formFilme').addEventListener('submit', function (event) {
  event.preventDefault(); // Evita o recarregamento

  const idFilme = document.getElementById('id').value;
  let filme = {};

  // Monta o objeto filme com os dados do formulário
  filme = {
    "_id": idFilme,
    "title": document.getElementById('titulo').value,
    "year": parseInt(document.getElementById('ano').value),
    "director": document.getElementById('diretor').value,
    "actors": document.getElementById('atores').value,
    "aka": document.getElementById('aka').value,
    "imdb_id": document.getElementById('imdb_id').value,
    "rank": parseInt(document.getElementById('rank').value)
  };

  salvaFilme(filme);
});

async function salvaFilme(filme) {
  const method = filme.hasOwnProperty('_id') ? 'PUT' : 'POST';
  const endpoint = filme.hasOwnProperty('_id') ? `/filmes/${filme._id}` : '/filmes';

  try {
    const response = await fetch(`${urlBase}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'access-token': access_token,
      },
      body: JSON.stringify(filme),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.acknowledged) {
        alert('Filme salvo com sucesso!');
        document.getElementById('formFilme').reset();
        carregaFilmes();
      } else if (data.errors) {
        const errorMessages = data.errors.map((error) => error.msg).join('\n');
        document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`;
        resultadoModal.show();
      } else {
        document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`;
        resultadoModal.show();
      }
    }
  } catch (error) {
    document.getElementById('mensagem').innerHTML = `<span class='text-danger'>Erro ao salvar o filme: ${error.message}</span>`;
    resultadoModal.show();
  }
}

async function carregaFilmes() {
    const tabela = document.getElementById('dadosTabela');
    tabela.innerHTML = ''; // Limpa a tabela antes de recarregar
  
    try {
      const response = await fetch(`${urlBase}/filmes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access-token': access_token,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        data.forEach((filme) => {
          tabela.innerHTML += `
            <tr>
              <td>${filme.title}</td>
              <td>${filme.year}</td>
              <td>${filme.director}</td>
              <td>${filme.actors}</td>
              <td>${filme.aka}</td>
              <td>${filme.imdb_id}</td>
              <td>${filme.rank}</td>
              <td>
                <button class='btn btn-warning btn-sm' onclick='editarFilme("${filme._id}")'>Editar</button>
                <button class='btn btn-danger btn-sm' onclick='excluirFilme("${filme._id}")'>Excluir</button>
              </td>
            </tr>
          `;
        });
      }
    } catch (error) {
      document.getElementById('mensagem').innerHTML = `<span class='text-danger'>Erro ao carregar os filmes: ${error.message}</span>`;
      resultadoModal.show();
    }
  }
  
  async function editarFilme(id) {
    try {
      const response = await fetch(`${urlBase}/filmes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access-token': access_token,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Preencha o formulário com os dados do filme selecionado para edição
        document.getElementById('id').value = data._id;
        document.getElementById('titulo').value = data.title;
        document.getElementById('ano').value = data.year;
        document.getElementById('diretor').value = data.director;
        document.getElementById('atores').value = data.actors;
        document.getElementById('aka').value = data.aka;
        document.getElementById('imdb_id').value = data.imdb_id;
        document.getElementById('rank').value = data.rank;
      }
    } catch (error) {
      document.getElementById('mensagem').innerHTML = `<span class='text-danger'>Erro ao carregar dados do filme: ${error.message}</span>`;
      resultadoModal.show();
    }
  }
  
  async function excluirFilme(id) {
    if (confirm('Deseja realmente excluir o filme?')) {
      try {
        const response = await fetch(`${urlBase}/filmes/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'access-token': access_token,
          },
        });
  
        const data = await response.json();
  
        if (response.ok && data.deletedCount > 0) {
          alert('Filme excluído com sucesso!');
          carregaFilmes();
        }
      } catch (error) {
        document.getElementById('mensagem').innerHTML = `<span class='text-danger'>Erro ao excluir filme: ${error.message}</span>`;
        resultadoModal.show();
      }
    }
  }
