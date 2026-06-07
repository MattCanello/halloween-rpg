function verificarResposta() {
    const resposta = document.getElementById('resposta').value.toLowerCase();

    if (resposta === 'travessa') {
        window.location.href = 'q2.html';
        return true;
    }

    return false;
}