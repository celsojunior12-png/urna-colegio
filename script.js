// ============================================================
// URNA ELETRÔNICA EDUCACIONAL
// Colégio Estadual James Patrick Clark
// ============================================================

// SENHA ADMINISTRATIVA
// Altere o valor abaixo caso queira definir outra senha.
const ADMIN_PASSWORD = '240709';

let isAuthenticated = false;

const candidatos = [
    {
        numero: '10',
        nome: 'Ana Silva',
        partido: 'Partido da Inovação (PI)',
        numeroPartido: '10'
    },
    {
        numero: '20',
        nome: 'Bruno Costa',
        partido: 'Partido do Futuro (PF)',
        numeroPartido: '20'
    },
    {
        numero: '30',
        nome: 'Carla Souza',
        partido: 'Partido da Educação (PE)',
        numeroPartido: '30'
    }
];

const partidos = [
    { numero: '10', nome: 'Partido da Inovação (PI)' },
    { numero: '20', nome: 'Partido do Futuro (PF)' },
    { numero: '30', nome: 'Partido da Educação (PE)' }
];

let enteredDigits = '';
let isBranco = false;
let isFim = false;

const votosPadrao = {
    candidatos: { '10': 0, '20': 0, '30': 0 },
    legenda: { '10': 0, '20': 0, '30': 0 },
    brancos: 0,
    nulos: 0
};

let votos = JSON.parse(localStorage.getItem('urna_votos')) || votosPadrao;

// ------------------------------------------------------------
// ÁUDIO
// ------------------------------------------------------------

function playBeep(freq = 440, duration = 0.1) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function playEndSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const playNote = (freq, start, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, ctx.currentTime + start);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
        };

        playNote(523.25, 0, 0.15);
        playNote(659.25, 0.15, 0.3);
    } catch (e) {}
}

// ------------------------------------------------------------
// TELA DE VOTAÇÃO
// ------------------------------------------------------------

function updateScreen() {
    const screen = document.getElementById('screen');

    if (isFim) {
        screen.innerHTML = `<div class="screen-fim">FIM</div>`;
        return;
    }

    if (isBranco) {
        screen.innerHTML = `
            <div class="screen-header">Votação para Representante</div>
            <div class="screen-body" style="text-align:center;">
                <h2 style="font-size:2rem;color:#fff;">VOTO EM BRANCO</h2>
                <span class="candidate-badge badge-white">VOTO EM BRANCO</span>
            </div>
            <div class="screen-footer">
                Aperte <strong>CONFIRMA</strong> para registrar seu voto.<br>
                Aperte <strong>CORRIGE</strong> para reiniciar seu voto.
            </div>
        `;
        return;
    }

    const cand = candidatos.find(c => c.numero === enteredDigits);
    const part = partidos.find(p => p.numero === enteredDigits);

    let bodyContent = '';

    if (enteredDigits.length === 0) {
        bodyContent = `
            <p style="color:#b9c9df;">Digite o número do seu candidato ou partido:</p>
            <div class="digit-boxes">
                <div class="digit-box active"></div>
                <div class="digit-box"></div>
            </div>
        `;
    } else if (enteredDigits.length === 1) {
        bodyContent = `
            <p style="color:#b9c9df;">Digite o próximo dígito:</p>
            <div class="digit-boxes">
                <div class="digit-box">${enteredDigits[0]}</div>
                <div class="digit-box active"></div>
            </div>
        `;
    } else if (cand) {
        bodyContent = `
            <div class="digit-boxes">
                <div class="digit-box">${enteredDigits[0]}</div>
                <div class="digit-box">${enteredDigits[1]}</div>
            </div>
            <div class="candidate-info">
                <h2>${cand.nome}</h2>
                <p>${cand.partido}</p>
                <span class="candidate-badge badge-valid">Voto válido para candidato</span>
            </div>
        `;
    } else if (part) {
        bodyContent = `
            <div class="digit-boxes">
                <div class="digit-box">${enteredDigits[0]}</div>
                <div class="digit-box">${enteredDigits[1]}</div>
            </div>
            <div class="candidate-info">
                <h2>VOTO DE LEGENDA</h2>
                <p>${part.nome}</p>
                <span class="candidate-badge badge-legenda">Voto para o partido</span>
            </div>
        `;
    } else {
        bodyContent = `
            <div class="digit-boxes">
                <div class="digit-box">${enteredDigits[0]}</div>
                <div class="digit-box">${enteredDigits[1]}</div>
            </div>
            <div class="candidate-info">
                <h2>NÚMERO INEXISTENTE</h2>
                <p>Nenhum candidato/partido encontrado.</p>
                <span class="candidate-badge badge-null">Voto nulo</span>
            </div>
        `;
    }

    screen.innerHTML = `
        <div class="screen-header">Votação para Representante</div>
        <div class="screen-body">${bodyContent}</div>
        <div class="screen-footer">
            Aperte <strong>CONFIRMA</strong> para registrar seu voto.<br>
            Aperte <strong>CORRIGE</strong> para reiniciar seu voto.
        </div>
    `;
}

// ------------------------------------------------------------
// TECLADO
// ------------------------------------------------------------

function pressNum(num) {
    if (isFim || isBranco) return;

    if (enteredDigits.length < 2) {
        playBeep(500, 0.05);
        enteredDigits += num;
        updateScreen();
    }
}

function pressBranco() {
    if (isFim) return;

    playBeep(500, 0.05);
    isBranco = true;
    enteredDigits = '';
    updateScreen();
}

function pressCorrige() {
    if (isFim) return;

    playBeep(400, 0.08);
    isBranco = false;
    enteredDigits = '';
    updateScreen();
}

function pressConfirma() {
    if (isFim) return;

    let votoComputado = false;

    if (isBranco) {
        votos.brancos++;
        votoComputado = true;
    } else if (enteredDigits.length === 2) {
        const cand = candidatos.find(c => c.numero === enteredDigits);
        const part = partidos.find(p => p.numero === enteredDigits);

        if (cand) {
            votos.candidatos[cand.numero]++;
        } else if (part) {
            votos.legenda[part.numero]++;
        } else {
            votos.nulos++;
        }

        votoComputado = true;
    }

    if (votoComputado) {
        saveVotos();
        playEndSound();

        isFim = true;
        updateScreen();

        setTimeout(() => {
            isFim = false;
            isBranco = false;
            enteredDigits = '';
            updateScreen();
        }, 2000);
    }
}

// ------------------------------------------------------------
// ARMAZENAMENTO
// ------------------------------------------------------------

function saveVotos() {
    localStorage.setItem('urna_votos', JSON.stringify(votos));
}

function resetVotacao() {
    if (!confirm('Tem certeza que deseja zerar todos os votos acumulados na urna?')) {
        return;
    }

    votos = {
        candidatos: { '10': 0, '20': 0, '30': 0 },
        legenda: { '10': 0, '20': 0, '30': 0 },
        brancos: 0,
        nulos: 0
    };

    saveVotos();
    renderBoletim();

    alert('A urna foi reiniciada.');
}

// ------------------------------------------------------------
// AUTENTICAÇÃO
// ------------------------------------------------------------

function checkPassword() {
    const input = document.getElementById('admin-pass');
    const error = document.getElementById('auth-error');

    if (input.value === ADMIN_PASSWORD) {
        isAuthenticated = true;
        input.value = '';
        error.style.display = 'none';

        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('boletim-screen').style.display = 'block';

        renderBoletim();
    } else {
        error.style.display = 'block';
        input.value = '';
    }
}

function lockResultado() {
    isAuthenticated = false;

    document.getElementById('auth-screen').style.display = 'block';
    document.getElementById('boletim-screen').style.display = 'none';
}

// ------------------------------------------------------------
// BOLETIM
// ------------------------------------------------------------

function renderBoletim() {
    const totalNominais = Object.values(votos.candidatos)
        .reduce((a, b) => a + b, 0);

    const totalLegendas = Object.values(votos.legenda)
        .reduce((a, b) => a + b, 0);

    const totalValidos = totalNominais + totalLegendas;
    const totalVotos = totalValidos + votos.brancos + votos.nulos;

    document.getElementById('stat-total').innerText = totalVotos;
    document.getElementById('stat-validos').innerText = totalNominais;
    document.getElementById('stat-legenda').innerText = totalLegendas;
    document.getElementById('stat-brancos').innerText = votos.brancos;
    document.getElementById('stat-nulos').innerText = votos.nulos;

    const tbodyCand = document.getElementById('table-candidatos');

    tbodyCand.innerHTML = candidatos.map(c => {
        const numVotos = votos.candidatos[c.numero] || 0;
        const pct = totalValidos > 0
            ? ((numVotos / totalValidos) * 100).toFixed(1)
            : '0.0';

        return `
            <tr>
                <td><strong>${c.numero}</strong></td>
                <td>${c.nome}</td>
                <td>${c.partido}</td>
                <td><strong>${numVotos}</strong></td>
                <td>${pct}%</td>
            </tr>
        `;
    }).join('');

    const tbodyPart = document.getElementById('table-partidos');

    tbodyPart.innerHTML = partidos.map(p => {
        const votosLeg = votos.legenda[p.numero] || 0;
        const cand = candidatos.find(c => c.numeroPartido === p.numero);
        const votosCand = cand ? (votos.candidatos[cand.numero] || 0) : 0;
        const totalPartido = votosLeg + votosCand;

        return `
            <tr>
                <td><strong>${p.numero}</strong></td>
                <td>${p.nome}</td>
                <td>${votosLeg}</td>
                <td>
                    <strong>${totalPartido}</strong>
                    (${votosCand} nominais + ${votosLeg} legenda)
                </td>
            </tr>
        `;
    }).join('');
}

// ------------------------------------------------------------
// NAVEGAÇÃO
// ------------------------------------------------------------

function switchTab(tab) {
    document.querySelectorAll('.tab-btn')
        .forEach(btn => btn.classList.remove('active'));

    const votacao = document.getElementById('tab-vota');
    const resultado = document.getElementById('tab-resultado');

    if (tab === 'vota') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        votacao.style.display = 'grid';
        resultado.classList.remove('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        votacao.style.display = 'none';
        resultado.classList.add('active');

        if (!isAuthenticated) {
            document.getElementById('auth-screen').style.display = 'block';
            document.getElementById('boletim-screen').style.display = 'none';
        } else {
            renderBoletim();
        }
    }
}

// ------------------------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------------------------

updateScreen();
