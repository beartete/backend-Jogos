document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formCadastro');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const idade = document.getElementById('idade').value;

    let ativo = false;
    if (document.getElementById('generoM').checked) {
      ativo = true;
    }

    const usuario = {
      nome: nome,
      email: email,
      senha: senha,
      idade: idade,
      ativo: ativo
    };

    fetch('URL_DO_BACKEND/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Erro ao cadastrar usuário');
      }
    })
    .then(data => {
      console.log('Usuário cadastrado:', data);
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Erro:', error.message);
    });
  });
});
