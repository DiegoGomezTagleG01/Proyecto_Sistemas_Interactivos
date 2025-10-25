// 🎨 Cargar categorías
fetch("data/categories.json")
  .then(res => res.json())
  .then(data => {
    const select = document.getElementById("categoria");
    data.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.nombre;
      option.textContent = `${cat.emoji} ${cat.nombre}`;
      select.appendChild(option);
    });
  });

// 🔔 Mostrar mensaje motivacional
function mostrarMensajeMotivacional(tipo) {
  const mensaje = tipo === "ingreso"
    ? "💪 ¡Vas muy bien, sigue ahorrando!"
    : "⚠️ Cuidado, tus gastos aumentaron esta semana.";
  alert(mensaje); // Reemplazar por toast animado
}
