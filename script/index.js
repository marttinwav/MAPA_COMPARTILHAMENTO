// =======================
// MAPAS BASE
// =======================
var rua = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
});

var satelite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: '© Esri' }
);

// =======================
// MAPA
// =======================
var map = L.map('map', {
  center: [-25.53, -54.47],
  zoom: 13,
  layers: [rua]
});

// =======================
// CAMADAS
// =======================
var camadaVermelha = L.layerGroup().addTo(map);
var camadaPreta = L.layerGroup().addTo(map);
const marcadoresPorId = new Map(); // Armazena todos os marcadores por ID


// =======================
// FUNÇÃO PARA ADICIONAR PONTOS
// =======================
function adicionarPonto(lat, lng, id, cor, camada) {
  const marcador = L.circleMarker([lat, lng], {
    radius: 6,
    color: cor,
    fillColor: cor,
    fillOpacity: 0.9
  })
  .bindPopup("<b>ID do Poste:</b> " + id)
  .addTo(camada);

  marcadoresPorId.set(id, marcador); // Armazena o marcador
}

// FUNÇÃO ADICIONAR NOVO PONTO

function adicionarNovoPonto() {
  const id = document.getElementById("novo-id").value.trim();
  const lat = parseFloat(document.getElementById("novo-lat").value.trim());
  const lng = parseFloat(document.getElementById("novo-lng").value.trim());
  const corEscolhida = document.getElementById("novo-cor").value;

  if (!id || isNaN(lat) || isNaN(lng)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  let cor = "gray";
  let camada = camadaPreta;

  if (corEscolhida === "vermelho") {
    cor = "red";
    camada = camadaVermelha;
  } else if (corEscolhida === "preto") {
    cor = "black";
    camada = camadaPreta;
  }

  if (marcadoresPorId.has(id)) {
    alert("Já existe um ponto com esse ID.");
    return;
  }

  adicionarPonto(lat, lng, id, cor, camada);

  // Atualizar contador
  document.querySelectorAll(".item strong")[0].textContent = camadaVermelha.getLayers().length;
  document.querySelectorAll(".item strong")[1].textContent = camadaPreta.getLayers().length;

  // Limpar campos
  document.getElementById("novo-id").value = "";
  document.getElementById("novo-lat").value = "";
  document.getElementById("novo-lng").value = "";

  // Salvar no localStorage
const ponto = { id, lat, lng, cor: corEscolhida };
const pontosSalvos = JSON.parse(localStorage.getItem("pontosAdicionados") || "[]");
pontosSalvos.push(ponto);
localStorage.setItem("pontosAdicionados", JSON.stringify(pontosSalvos));

// Carrega pontos salvos localmente (localStorage)
function carregarPontosSalvos() {
  const pontosSalvos = CSV.parse(localStorage.getItem("pontos") || "[]");

  pontosSalvos.forEach(p => {
    let cor = "gray";
    let camada = camadaPreta;

    if (p.cor === "vermelho") {
      cor = "red";
      camada = camadaVermelha;
    } else if (p.cor === "preto") {
      cor = "black";
      camada = camadaPreta;
    }

    if (!marcadoresPorId.has(p.id)) {
      adicionarPonto(parseFloat(p.lat), parseFloat(p.lng), p.id, cor, camada);
    }
  });

  document.querySelectorAll(".item strong")[0].textContent = camadaVermelha.getLayers().length;
  document.querySelectorAll(".item strong")[1].textContent = camadaPreta.getLayers().length;
}

carregarPontosSalvos();


}





// =======================
// PONTOS EXEMPLO
// =======================


// Carrega o CSV e adiciona os pontos
fetch("pontos.csv")
  .then(response => response.text())
  .then(csvText => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        results.data.forEach(p => {
          const corOriginal = p.cor.trim().toLowerCase();
          let cor;
          
          switch (corOriginal) {
            case "vermelho":
              cor = "red";
              break;
              case "preto":
                cor = "black";
                break;
                default:
                  cor = "gray"; // fallback
                }
                
                const camada = cor === "red" ? camadaVermelha : camadaPreta;
                
                adicionarPonto(parseFloat(p.lat), parseFloat(p.lng), p.id, cor, camada);
                
                
                
                // Atualiza contador do painel
                setTimeout(() => {
                  document.querySelectorAll(".item strong")[0].textContent = camadaVermelha.getLayers().length;
                  document.querySelectorAll(".item strong")[1].textContent = camadaPreta.getLayers().length;
                }, 100);
              });
              }
            });
          });


// =======================
// CONTROLE MAPA BASE
// =======================
L.control.layers(
  { "Rua": rua, "Satélite": satelite },
  null,
  { collapsed: false }
).addTo(map);

// =======================
// FUNÇÃO TOGGLE
// =======================
function toggleCamada(camada, elemento) {
  if (map.hasLayer(camada)) {
    map.removeLayer(camada);
    elemento.classList.remove("ativo");
  } else {
    map.addLayer(camada);
    elemento.classList.add("ativo");
  }
}

// FUNÇÃO BUSCAR PELO ID

document.getElementById('busca-id').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const idBuscado = this.value.trim();
    const marcador = marcadoresPorId.get(idBuscado);

    if (marcador) {
      map.setView(marcador.getLatLng(), 17);
      marcador.openPopup();
    } else {
      alert("Poste com ID '" + idBuscado + "' não encontrado.");
    }
  }
});

// // FUNÇÃO EXPORTAR CSV

// function exportarCSV() {
//   const pontos = JSON.parse(localStorage.getItem("pontosAdicionados") || "[]");
//   if (pontos.length === 0) {
//     alert("Nenhum ponto novo adicionado.");
//     return;
//   }

//   const linhas = ["id,lat,lng,cor"];
//   pontos.forEach(p => {
//     linhas.push(`${p.id},${p.lat},${p.lng},${p.cor}`);
//   });

//   const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8;" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = "pontos_adicionados.csv";
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }



// =======================
// PAINEL PERSONALIZADO
// =======================
var painel = L.control({ position: 'topleft' });

painel.onAdd = function () {
  var div = L.DomUtil.create('div', 'painel-controle');

  div.innerHTML = `
    <div class="painel-titulo">MAPA PS STI DATALINUX</div>

    <div class="item ativo" onclick="toggleCamada(camadaVermelha, this)">
      <div class="linha">
        <div class="bolinha" style="background:red"></div>
        Postes não considerados
      </div>
      <strong>${camadaVermelha.getLayers().length}</strong>
    </div>

    <div class="item ativo" onclick="toggleCamada(camadaPreta, this)">
      <div class="linha">
        <div class="bolinha" style="background:black"></div>
        PS necessário a elaboração do projeto identificados como revelia
      </div>
      <strong>${camadaPreta.getLayers().length}</strong>
    </div>

    <div class="info">
      DATALINUX • Santa terezinha de Itaipu<br>
      Clique no nome para ativar/desativar
    </div>
    <div style="margin-top:12px;">
  <input type="text" id="novo-id" placeholder="ID" style="width:100%;margin-bottom:6px;padding:6px;border:1px solid #ccc;border-radius:6px;">
  <input type="number" id="novo-lat" placeholder="Latitude" style="width:100%;margin-bottom:6px;padding:6px;border:1px solid #ccc;border-radius:6px;">
  <input type="number" id="novo-lng" placeholder="Longitude" style="width:100%;margin-bottom:6px;padding:6px;border:1px solid #ccc;border-radius:6px;">
  <select id="novo-cor" style="width:100%;margin-bottom:6px;padding:6px;border:1px solid #ccc;border-radius:6px;">
    <option value="preto">Considerado</option>
    <option value="vermelho">Não considerado</option>
  </select>
  <button onclick="adicionarNovoPonto()" style="width:100%;padding:8px;background:#007bff;color:white;border:none;border-radius:6px;">Adicionar Ponto</button>
  <button onclick="exportarCSV()" style="width:100%;padding:8px;background:#28a745;color:white;border:none;border-radius:6px;margin-top:6px;">Exportar CSV</button>

</div>

  `;

  L.DomEvent.disableClickPropagation(div);
  return div;
};

painel.addTo(map);