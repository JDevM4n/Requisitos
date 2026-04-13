let convocatorias = [];

const nivelSelect = document.getElementById("nivel");
const facultadSelect = document.getElementById("facultad");
const modalidadSelect = document.getElementById("modalidad");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");
const resultsContainer = document.getElementById("results");
const resultsCount = document.getElementById("resultsCount");

async function cargarDatos() {
  try {
    const response = await fetch("requisitos.json");
    if (!response.ok) {
      throw new Error("No se pudo cargar requisitos.json");
    }

    convocatorias = await response.json();
    poblarFiltros();
    renderizarResultados(convocatorias);
  } catch (error) {
    console.error(error);
    resultsCount.textContent = "No se pudo cargar la información.";
    resultsContainer.innerHTML = `
      <article class="empty-state">
        Ocurrió un error al cargar los requisitos.
      </article>
    `;
  }
}

function obtenerValoresUnicos(lista, campo) {
  return [...new Set(lista.map(item => item[campo]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function poblarSelect(select, valores, textoTodos) {
  select.innerHTML = `<option value="">${textoTodos}</option>`;
  valores.forEach(valor => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });
}

function poblarFiltros() {
  poblarSelect(nivelSelect, obtenerValoresUnicos(convocatorias, "nivel"), "Todos");
  poblarSelect(facultadSelect, obtenerValoresUnicos(convocatorias, "facultad"), "Todos");
  poblarSelect(modalidadSelect, obtenerValoresUnicos(convocatorias, "modalidad"), "Todas");
}

function filtrarConvocatorias() {
  const nivel = nivelSelect.value;
  const facultad = facultadSelect.value;
  const modalidad = modalidadSelect.value;

  return convocatorias.filter(item => {
    const cumpleNivel = !nivel || item.nivel === nivel;
    const cumpleFacultad = !facultad || item.facultad === facultad;
    const cumpleModalidad = !modalidad || item.modalidad === modalidad;

    return cumpleNivel && cumpleFacultad && cumpleModalidad;
  });
}

function crearListaHTML(items) {
  return items.map(item => `<li>${item}</li>`).join("");
}

function renderizarResultados(data) {
  resultsCount.textContent = `${data.length} resultado(s) encontrado(s)`;

  if (!data.length) {
    resultsContainer.innerHTML = `
      <article class="empty-state">
        No encontramos convocatorias con esos filtros. Prueba con otra combinación.
      </article>
    `;
    return;
  }

  resultsContainer.innerHTML = data.map(item => `
    <article class="result-card">
      <div class="card-top">
        <div>
          <h3 class="card-title">${item.titulo}</h3>
        </div>

        <div class="badges">
          <span class="badge">${item.nivel}</span>
          <span class="badge">${item.facultad}</span>
          <span class="badge">${item.modalidad}</span>
        </div>
      </div>

      <p class="card-desc">${item.descripcion}</p>

      <div class="requirements-box">
        <h3>Requisitos</h3>
        <ul class="requirements-list">
          ${crearListaHTML(item.requisitos)}
        </ul>
      </div>

      <div class="extra-grid">
        ${
          item.programas_aplica?.length
            ? `
          <section class="programs-box">
            <h3>Aplica para</h3>
            <ul class="programs-list">
              ${crearListaHTML(item.programas_aplica)}
            </ul>
          </section>
        `
            : ""
        }

        ${
          item.notas?.length
            ? `
          <section class="notes-box">
            <h3>Notas importantes</h3>
            <ul class="notes-list">
              ${crearListaHTML(item.notas)}
            </ul>
          </section>
        `
            : ""
        }
      </div>
    </article>
  `).join("");
}

btnBuscar.addEventListener("click", () => {
  const resultados = filtrarConvocatorias();
  renderizarResultados(resultados);
});

btnLimpiar.addEventListener("click", () => {
  nivelSelect.value = "";
  facultadSelect.value = "";
  modalidadSelect.value = "";
  renderizarResultados(convocatorias);
});

cargarDatos();
