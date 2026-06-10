function iniciarJogo(respostaCorreta, proximaPagina) {
    const mensagensErro = [
        '🛑 Até aqui tu chegarás, mas daqui não passarás.',
        '🥱 A festa vai ter terminado até você conseguir passar dessa.',
        '😴 Não leve a noite toda! Zzzzzz...',
        '🎲 Na rolagem de intelecto, você sempre tira -1.',
        '🕳️ Você olha para o abismo... e até o abismo desiste de você.',
        '👹 Até um zumbi de sangue se sairia melhor do que isso.',
        '🤔 Já tentou... PENSAR?!?!?!!?!?!!??!',
        '🤪 Só não tá mais feio do que esse site!',
        '🫨 De novo! De novo! De novo!'
    ];

    let ultimoIndiceErro = -1;

    const form = document.querySelector('form');
    const campoResposta = document.getElementById('resposta');
    const feedbackResposta = document.getElementById('feedback-resposta');

    function obterMensagemErroAleatoria() {
        if (mensagensErro.length === 1) {
            return mensagensErro[0];
        }

        let indiceAleatorio = Math.floor(Math.random() * mensagensErro.length);

        while (indiceAleatorio === ultimoIndiceErro) {
            indiceAleatorio = Math.floor(Math.random() * mensagensErro.length);
        }

        ultimoIndiceErro = indiceAleatorio;
        return mensagensErro[indiceAleatorio];
    }

    function verificarResposta() {
        const resposta = campoResposta.value.trim().toLowerCase();

        if (resposta === respostaCorreta) {
            window.location.href = proximaPagina;
            return true;
        }

        feedbackResposta.textContent = obterMensagemErroAleatoria();
        campoResposta.classList.add('input-erro');
        campoResposta.focus();

        return false;
    }

    form.onsubmit = function(event) {
        event.preventDefault();
        return verificarResposta();
    };
}