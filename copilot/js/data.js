// 📦 Cargar transacciones guardadas
function cargarDatos() {
  const datos = localStorage.getItem("transacciones");
  if (datos) {
    transacciones = JSON.parse(datos);
    actualizarBalance();
  }
}

window.onload = cargarDatos;
