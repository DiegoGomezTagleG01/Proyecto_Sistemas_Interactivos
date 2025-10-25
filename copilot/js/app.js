// 📊 Variables globales
let transacciones = [];
let balance = 0;

// 📥 Agregar transacción
function agregarTransaccion(monto, categoria, tipo, fecha) {
  const transaccion = { monto, categoria, tipo, fecha };
  transacciones.push(transaccion);
  guardarDatos();
  actualizarBalance();
  mostrarMensajeMotivacional(tipo);
}

// 💾 Guardar en localStorage
function guardarDatos() {
  localStorage.setItem("transacciones", JSON.stringify(transacciones));
}

// 📈 Actualizar balance
function actualizarBalance() {
  balance = transacciones.reduce((acc, t) => {
    return t.tipo === "ingreso" ? acc + t.monto : acc - t.monto;
  }, 0);
  document.getElementById("balance").textContent = `Balance: $${balance}`;
}
