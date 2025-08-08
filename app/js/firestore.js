// /app/js/firestore.js

// Esperar a que el DOM y Firebase estén listos
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form-caso");
  if (!form) return;

  // Verificar autenticación con espera
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      alert("❌ No estás autenticado. Redirigiendo al login...");
      window.location.href = "/app/login.html";
      return;
    }

    // Solo si el usuario está autenticado, agregar el listener
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const db = firebase.firestore();
        const storage = firebase.storage();

        // 1. Generar ID del caso
        const year = new Date().getFullYear();
        const snapshot = await db.collection("casos")
          .where("casoId", ">=", `CT-${year}-`)
          .where("casoId", "<", `CT-${year}-\uf8ff`)
          .get();
        const count = snapshot.size + 1;
        const casoId = `CT-${year}-${count.toString().padStart(3, '0')}`;

        // 2. Datos del cliente
        const clienteId = document.getElementById("cliente-id").value.trim().toUpperCase();
        const clienteData = {
          nombre: document.getElementById("cliente-nombre").value,
          tipo: clienteId.startsWith('V') ? 'natural' : 'juridico',
          telefono: document.getElementById("cliente-telefono").value,
          correo: document.getElementById("cliente-correo").value || null,
          direccion: document.getElementById("cliente-direccion").value,
          esRecurrente: true,
          fechaRegistro: new Date(),
          ultimoServicio: new Date(),
          totalCasos: 1,
          equipos: []
        };

        // 3. Múltiples equipos
        const equiposData = [];
        const equiposSeriales = [];
        const equipoBlocks = document.querySelectorAll(".equipo-block");

        for (const block of equipoBlocks) {
          const serial = block.querySelector(".equipo-serial").value.trim().toUpperCase() || `NO_SERIAL_${Date.now()}`;
          const equipo = {
            clienteId: clienteId,
            estado: "activo",
            tipo: block.querySelector(".equipo-tipo").value,
            marca: block.querySelector(".equipo-marca").value,
            modelo: block.querySelector(".equipo-modelo").value,
            serial: serial,
            ram: block.querySelector(".equipo-ram").value,
            disco: block.querySelector(".equipo-disco").value,
            sistemaOperativo: block.querySelector(".equipo-so").value,
            nombreUsuario: block.querySelector(".equipo-usuario").value,
            hostname: block.querySelector(".equipo-hostname").value,
            direccionIP: block.querySelector(".equipo-ip").value,
            direccionMAC: block.querySelector(".equipo-mac").value,
            fechaIncorporacion: new Date(),
            creadoPor: user.email,
            modificadoPor: user.email
          };
          equiposData.push(equipo);
          equiposSeriales.push(serial);
        }

        // 4. Diagnóstico
        const diagnostico = {
          hardware: {
            enciende: document.getElementById("hw-enciende").checked,
            pantalla: document.getElementById("hw-pantalla").checked,
            ventilacion: document.getElementById("hw-ventilacion").checked,
            puertos: document.getElementById("hw-puertos").checked,
            limpiezaRealizada: document.getElementById("hw-limpieza").checked,
            observaciones: document.getElementById("hw-observaciones").value
          },
          software: {
            sistemaInicia: document.getElementById("sw-inicia").checked,
            malwareDetectado: !document.getElementById("sw-malware").checked,
            actualizacionesPendientes: !document.getElementById("sw-actualizado").checked,
            respaldoRealizado: document.getElementById("sw-respaldo").checked,
            reinstalacion: document.getElementById("sw-reinstalacion").checked,
            observaciones: document.getElementById("sw-observaciones").value
          },
          redes: {
            conexionLocal: document.getElementById("red-local").checked,
            internet: document.getElementById("red-internet").checked,
            ipAsignada: document.getElementById("red-ip").checked,
            cables: document.getElementById("red-cables").checked,
            wifi: document.getElementById("red-wifi").checked,
            observaciones: document.getElementById("red-observaciones").value
          },
          fotos: []
        };

        // 5. Subir fotos
        const fileInput = document.getElementById("fotos");
        const files = fileInput?.files || [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `casos/${casoId}/fotos/${Date.now()}_${file.name}`;
          const ref = storage.ref().child(filePath);
          await ref.put(file);
          const url = await ref.getDownloadURL();
          diagnostico.fotos.push(url);
        }

        // 6. Guardar sin transacción
        const clienteRef = db.collection("clientes").doc(clienteId);
        const clienteDoc = await clienteRef.get();

        if (clienteDoc.exists) {
          const data = clienteDoc.data();
          const equipos = [...new Set([...(data.equipos || []), ...equiposSeriales])];
          await clienteRef.set({
            totalCasos: (data.totalCasos || 0) + 1,
            ultimoServicio: new Date(),
            equipos: equipos
          }, { merge: true });
        } else {
          await clienteRef.set({ ...clienteData, equipos: equiposSeriales });
        }

        // Guardar equipos
        for (const equipo of equiposData) {
          await db.collection("equipos").doc(equipo.serial).set(equipo, { merge: true });
        }

        // Guardar caso
        await db.collection("casos").doc(casoId).set({
          casoId: casoId,
          clienteId: clienteId,
          equipos: equiposSeriales,
          tecnicoAsignado: user.email,
          creadoPor: user.email,
          tipoServicio: ["hardware", "software", "redes"],
          problemaReportado: "Diagnóstico técnico en sitio",
          fechaSolicitud: new Date(),
          diagnostico: diagnostico,
          accionesRealizadas: [],
          repuestos: [],
          estado: "entregado",
          historialEstados: [
            { estado: "solicitado", fecha: new Date(), por: user.email },
            { estado: "entregado", fecha: new Date(), por: user.email }
          ],
          tiempoInicio: new Date(),
          tiempoFin: new Date(),
          duracionMinutos: 0,
          informeGenerado: false,
          firmaCliente: true
        });

        // ✅ Éxito
        alert(`✅ Caso ${casoId} guardado con éxito.`);
        window.location.href = '/app/index.html';

      } catch (error) {
        console.error("Error al guardar:", error);
        alert("❌ Error al guardar: " + error.message);
      }
    });
  });
});