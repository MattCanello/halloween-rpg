function verificarResposta() {
    const resposta = document.getElementById('resposta').value.toLowerCase();

    if (resposta === 'lanterna') {
        window.location.href = 'q3.html';
        return true;
    }

    return false;
}