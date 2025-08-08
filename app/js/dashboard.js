// /app/js/dashboard.js

// Mostrar nombre del usuario
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    document.getElementById("user-name").textContent = user.email.split('@')[0];

    // Cargar casos del técnico
    await cargarCasos(user.email);
    await cargarEstadisticas(user.email);
  } else {
    window.location.href = 'login.html';
  }
});

// Cargar casos del técnico
async function cargarCasos(tecnicoEmail) {
  const db = firebase.firestore();
  const tbody = document.getElementById("lista-casos");
  tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Cargando...</td></tr>`;

  try {
    const snapshot = await db.collection("casos")
      .where("tecnicoAsignado", "==", tecnicoEmail)
      .orderBy("fechaSolicitud", "desc")
      .limit(10)
      .get();

    tbody.innerHTML = '';

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No tienes casos registrados aún.</td></tr>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const clienteId = data.clienteId;
      const casoId = data.casoId;
      const estado = formatearEstado(data.estado);
      const fecha = new Date(data.fechaSolicitud.seconds * 1000).toLocaleDateString();

      const row = `
        <tr>
          <td><strong>${casoId}</strong></td>
          <td>${clienteId}</td>
          <td>${data.equipos[0] || 'Sin equipo'}</td>
          <td><span class="badge bg-${getEstadoColor(data.estado)}">${estado}</span></td>
          <td>${fecha}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="verCaso('${casoId}')">Ver</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="generarPDF('${casoId}')">PDF</button>
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
    });
  } catch (error) {
    console.error("Error al cargar casos:", error);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar datos.</td></tr>`;
  }
}

// Cargar estadísticas
async function cargarEstadisticas(tecnicoEmail) {
  const db = firebase.firestore();
  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  try {
    const snapshot = await db.collection("casos")
      .where("tecnicoAsignado", "==", tecnicoEmail)
      .get();

    const casos = snapshot.docs.map(d => d.data());
    const casosHoy = casos.filter(c => {
      const fecha = new Date(c.fechaSolicitud.seconds * 1000);
      fecha.setHours(0,0,0,0);
      return fecha.getTime() === hoy.getTime();
    });

    document.getElementById("casos-hoy").textContent = casosHoy.length;
    document.getElementById("casos-finalizados").textContent = casos.filter(c => c.estado === "entregado").length;
    document.getElementById("clientes-unicos").textContent = [...new Set(casos.map(c => c.clienteId))].length;
    document.getElementById("casos-pendientes").textContent = casos.filter(c => !["entregado", "finalizado"].includes(c.estado)).length;

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

// Formatear estado
function formatearEstado(estado) {
  const map = {
    solicitado: "Solicitado",
    asignado: "Asignado",
    diagnostico: "Diagnóstico",
    presupuestado: "Presupuestado",
    aprobado: "Aprobado",
    en_reparacion: "En reparación",
    finalizado: "Finalizado",
    entregado: "Entregado"
  };
  return map[estado] || estado;
}

// Color del badge según estado
function getEstadoColor(estado) {
  const colors = {
    solicitado: "secondary",
    asignado: "warning",
    diagnostico: "info",
    presupuestado: "primary",
    aprobado: "success",
    en_reparacion: "danger",
    finalizado: "dark",
    entregado: "success"
  };
  return colors[estado] || "light";
}

// Funciones futuras
function verCaso(id) {
  alert("Funcionalidad en desarrollo: Ver caso " + id);
  // window.location.href = `caso-detalle.html?id=${id}`;
}

function generarPDF(id) {
  alert("Generando informe técnico para el caso " + id);
  // Llamar a pdf-generator.js
}