document.addEventListener('DOMContentLoaded', () => {
    let registros = JSON.parse(localStorage.getItem('registros')) || [];

    const updateDateTime = () => {
        const now = new Date();
        document.getElementById('date-time').textContent = now.toLocaleString();
    };
    updateDateTime();
    setInterval(updateDateTime, 1000);

    const registrarPonto = (tipo) => {
        const now = new Date();
        const dataSelecionada = document.getElementById('data-ponto').value
            ? new Date(document.getElementById('data-ponto').value + 'T00:00:00') 
            : now;

        if (dataSelecionada > now) {
            alert('Não é permitido registrar pontos no futuro.');
            return;
        }

        let ultimoRegistro = registros[registros.length - 1];

        if (tipo === 'Entrada Expediente' || !ultimoRegistro || ultimoRegistro.saidaExpediente) {
            const ponto = {
                data: dataSelecionada.toLocaleDateString(),
                entradaExpediente: tipo === 'Entrada Expediente' ? now.toLocaleTimeString() : null,
                saidaExpediente: null,
                entradaIntervalo: null,
                saidaIntervalo: null,
                observacao: document.getElementById('observacao').value,
                justificado: document.getElementById('upload-arquivo').files.length > 0,
                noPassado: dataSelecionada < now 
            };
            registros.push(ponto);
        } else {
            if (tipo === 'Saída Expediente') {
                ultimoRegistro.saidaExpediente = now.toLocaleTimeString();
            } else if (tipo === 'Entrada Intervalo') {
                ultimoRegistro.entradaIntervalo = now.toLocaleTimeString();
            } else if (tipo === 'Saída Intervalo') {
                ultimoRegistro.saidaIntervalo = now.toLocaleTimeString();
            }
        }

        localStorage.setItem('registros', JSON.stringify(registros));
        atualizarTabela();
    };

    document.getElementById('entrada-expediente').addEventListener('click', () => registrarPonto('Entrada Expediente'));
    document.getElementById('saida-expediente').addEventListener('click', () => registrarPonto('Saída Expediente'));
    document.getElementById('entrada-intervalo').addEventListener('click', () => registrarPonto('Entrada Intervalo'));
    document.getElementById('saida-intervalo').addEventListener('click', () => registrarPonto('Saída Intervalo'));

    const atualizarTabela = () => {
        const tabela = document.getElementById('tabela-relatorio').querySelector('tbody');
        tabela.innerHTML = '';

        registros.forEach((registro, index) => {
            const row = document.createElement('tr');
            
            if (registro.noPassado) {
                row.style.backgroundColor = '#d1bdd0'; 
                row.style.fontWeight = 'bold'; 
            }
            if (registro.observacao) {
                row.style.fontWeight = 'bold'; 
            }
            row.innerHTML = `
                <td>${registro.data}</td>
                <td>${registro.entradaExpediente ? registro.entradaExpediente : '-'}</td>
                <td>${registro.saidaExpediente ? registro.saidaExpediente : '-'}</td>
                <td>${registro.entradaIntervalo ? registro.entradaIntervalo : '-'}</td>
                <td>${registro.saidaIntervalo ? registro.saidaIntervalo : '-'}</td>
                <td>
                    <button onclick="editarRegistro(${index})">Editar</button>
                    <button onclick="alert('Exclusão de ponto não permitida')">Excluir</button>
                </td>
            `;
            tabela.insertBefore(row, tabela.firstChild);
        });
    };

    window.editarRegistro = (index) => {
        let registro = registros[index];

        const novaData = prompt("Editar Data (DD/MM/AAAA):", registro.data);
        const novaEntrada = prompt("Editar Hora de Entrada (HH:MM):", registro.entradaExpediente || '');
        const novaSaida = prompt("Editar Hora de Saída (HH:MM):", registro.saidaExpediente || '');
        const novaEntradaIntervalo = prompt("Editar Hora de Entrada de Intervalo (HH:MM):", registro.entradaIntervalo || '');
        const novaSaidaIntervalo = prompt("Editar Hora de Saída de Intervalo (HH:MM):", registro.saidaIntervalo || '');
        const novaObservacao = prompt("Editar Observação:", registro.observacao);

        if (novaData !== null) {
            registro.data = novaData;
        }
        if (novaEntrada !== null) {
            registro.entradaExpediente = novaEntrada;
        }
        if (novaSaida !== null) {
            registro.saidaExpediente = novaSaida;
        }
        if (novaEntradaIntervalo !== null) {
            registro.entradaIntervalo = novaEntradaIntervalo;
        }
        if (novaSaidaIntervalo !== null) {
            registro.saidaIntervalo = novaSaidaIntervalo;
        }
        if (novaObservacao !== null) {
            registro.observacao = novaObservacao;
        }

        localStorage.setItem('registros', JSON.stringify(registros));
        atualizarTabela();
    };

    document.getElementById('filtrar-semana').addEventListener('click', () => {
        const agora = new Date();
        const umaSemanaAtras = new Date(agora);
        umaSemanaAtras.setDate(agora.getDate() - 7);
        const registrosFiltrados = registros.filter(registro => new Date(registro.data) >= umaSemanaAtras);
        atualizarTabelaFiltrada(registrosFiltrados);
    });

    document.getElementById('filtrar-mes').addEventListener('click', () => {
        const agora = new Date();
        const umMesAtras = new Date(agora);
        umMesAtras.setMonth(agora.getMonth() - 1);
        const registrosFiltrados = registros.filter(registro => new Date(registro.data) >= umMesAtras);
        atualizarTabelaFiltrada(registrosFiltrados);
    });

    const atualizarTabelaFiltrada = (registrosFiltrados) => {
        const tabela = document.getElementById('tabela-relatorio').querySelector('tbody');
        tabela.innerHTML = '';

        registrosFiltrados.forEach((registro) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${registro.data}</td>
                <td>${registro.entradaExpediente ? registro.entradaExpediente : '-'}</td>
                <td>${registro.saidaExpediente ? registro.saidaExpediente : '-'}</td>
                <td>${registro.entradaIntervalo ? registro.entradaIntervalo : '-'}</td>
                <td>${registro.saidaIntervalo ? registro.saidaIntervalo : '-'}</td>
                <td>
                    <button onclick="alert('Edição não permitida.')">Editar</button>
                    <button onclick="alert('Exclusão de ponto não permitida')">Excluir</button>
                </td>
            `;
            tabela.appendChild(row);
        });
    };

    atualizarTabela();
});
