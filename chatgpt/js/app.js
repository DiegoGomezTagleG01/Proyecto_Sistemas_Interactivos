/* app.js
   Lógica principal: inicialización, eventos, gráficos y gamificación.
   Comentarios y nombres en español.
*/

document.addEventListener('DOMContentLoaded', async ()=> {
  // Cargar estado
  let state = DataStore.cargar();
  state = await DataStore.initCategorias(state);

  // Inicializar UI
  UI.renderCategorias(state.categorias);

  // Set fecha por defecto (hoy)
  document.getElementById('fecha').value = (new Date()).toISOString().split('T')[0];

  // Tema inicial
  applyTheme(state.settings.theme);
  document.getElementById('accentColor').value = state.settings.accentColor;
  document.getElementById('toggleSounds').checked = state.settings.sounds;

  // Inicializar chart
  const ctx = document.getElementById('chartBalance').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {labels: [], datasets:[{label:'Balance',data:[],fill:true,tension:0.3}]},
    options: {
      animation:{duration:800},
      scales:{y:{beginAtZero:false}}
    }
  });

  // Función para recalcular métricas y actualizar UI
  function actualizarTodo(){
    // Recalcular balance total (suma ingresos - egresos)
    const total = state.transacciones.reduce((acc,t)=>{
      return acc + (t.tipo === 'ingreso' ? Number(t.monto) : -Number(t.monto));
    }, 0);
    UI.renderBalance(total, state.settings);

    // Actualizar lista
    UI.renderTransacciones(state.transacciones, state.categorias);

    // Actualizar gráfica: simplificación -> acumulado por fecha
    const perDate = {};
    const fechasOrdenadas = [];
    state.transacciones.forEach(t=>{
      const d = new Date(t.fecha || t.createdAt).toISOString().slice(0,10);
      if(!perDate[d]) perDate[d] = 0;
      perDate[d] += (t.tipo === 'ingreso' ? Number(t.monto) : -Number(t.monto));
    });
    // convertir en acumulado cronológico
    const fechas = Object.keys(perDate).sort();
    let acumulado = 0;
    const labels = [];
    const data = [];
    fechas.forEach(d=>{
      acumulado += perDate[d];
      labels.push(d);
      data.push(acumulado);
    });

    // Si no hay datos, muestra últimos 7 días vacío
    if(labels.length === 0){
      const hoy = new Date();
      for(let i=6;i>=0;i--){
        const dt = new Date(hoy); dt.setDate(hoy.getDate()-i);
        labels.push(dt.toISOString().slice(0,10));
        data.push(0);
      }
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();

    // Progreso meta
    UI.renderProgress(total > 0 ? total : 0, state.settings.goalAmount || 1000);

    // Guardar estado
    DataStore.guardar(state);
  }

  actualizarTodo();

  // FORM: envío de nueva transacción
  UI.DOM.form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const tipo = UI.DOM.tipo.value;
    const monto = Number(UI.DOM.monto.value);
    const categoriaId = UI.DOM.categoria.value;
    const fecha = UI.DOM.fecha.value || new Date().toISOString();
    const nota = UI.DOM.nota.value || '';

    // Validaciones básicas
    if(!monto || monto <= 0){
      UI.toast('Ingresa un monto válido.', 'warn');
      return;
    }
    if(!categoriaId){
      UI.toast('Selecciona una categoría.', 'warn');
      return;
    }

    // Crear objeto transacción
    const trans = {tipo, monto, categoriaId, fecha, nota};
    state = DataStore.agregarTransaccion(state, trans);
    UI.toast('Transacción guardada ✔️', 'success', {sound:true});
    // limpiar form
    UI.DOM.monto.value = '';
    UI.DOM.nota.value = '';
    // actualizar UI
    actualizarTodo();

    // pos-gamificación: comprobar logros (ejemplo simple)
    checkAchievements();
  });

  // Botones eliminar/editar (eventos delegados desde UI)
  document.addEventListener('ui:deleteTransaction', (e)=>{
    const id = e.detail.id;
    if(confirm('¿Eliminar esta transacción?')){
      state = DataStore.eliminarTransaccion(state, id);
      UI.toast('Transacción eliminada', 'info');
      actualizarTodo();
    }
  });

  document.addEventListener('ui:editTransaction', (e)=>{
    const id = e.detail.id;
    const t = state.transacciones.find(x => x.id === id);
    if(!t) return;
    // Rellenar formulario para edición simple (podría mejorarse)
    UI.DOM.tipo.value = t.tipo;
    UI.DOM.monto.value = t.monto;
    UI.DOM.categoria.value = t.categoriaId;
    UI.DOM.fecha.value = new Date(t.fecha).toISOString().slice(0,10);
    UI.DOM.nota.value = t.nota;
    // eliminar la original (edición simple)
    state = DataStore.eliminarTransaccion(state, id);
    actualizarTodo();
    UI.toast('Editando transacción (modifica y guarda).', 'info');
  });

  // Configuración panel
  UI.DOM.btnSettings.addEventListener('click', ()=>{
    UI.DOM.panelSettings.setAttribute('aria-hidden','false');
  });
  UI.DOM.closeSettings.addEventListener('click', ()=>{
    UI.DOM.panelSettings.setAttribute('aria-hidden','true');
  });

  // Tema toggle
  UI.DOM.btnToggleTheme.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    state.settings.theme = next;
    DataStore.guardar(state);
  });

  UI.DOM.themeSelect.addEventListener('change', (e)=>{
    applyTheme(e.target.value);
    state.settings.theme = e.target.value;
    DataStore.guardar(state);
  });

  UI.DOM.accentColor.addEventListener('input', (e)=>{
    document.documentElement.style.setProperty('--accent', e.target.value);
    state.settings.accentColor = e.target.value;
    DataStore.guardar(state);
  });

  UI.DOM.toggleSounds.addEventListener('change', (e)=>{
    state.settings.sounds = e.target.checked;
    DataStore.guardar(state);
  });

  // Category manager: agregar
  UI.DOM.addCategoryBtn.addEventListener('click', ()=>{
    const emoji = UI.DOM.newCatEmoji.value.trim() || '❔';
    const nombre = UI.DOM.newCatName.value.trim();
    if(!nombre) { UI.toast('Ingresa un nombre para la categoría.', 'warn'); return; }
    const tipo = confirm('¿Es una categoría de ingreso? (Aceptar = Ingreso, Cancelar = Egreso)') ? 'ingreso' : 'egreso';
    state = DataStore.agregarCategoria(state, {emoji, nombre, tipo});
    UI.renderCategorias(state.categorias);
    UI.toast('Categoría añadida', 'success');
    UI.DOM.newCatEmoji.value = ''; UI.DOM.newCatName.value = '';
  });

  // Delete category (evento delegado)
  document.addEventListener('ui:deleteCategory', (e)=>{
    const id = e.detail.id;
    if(confirm('Eliminar categoría (las transacciones no se reasignarán). Confirmar?')){
      state = DataStore.eliminarCategoria(state, id);
      UI.renderCategorias(state.categorias);
      UI.toast('Categoría eliminada', 'info');
    }
  });

  // Periodo grafica
  UI.DOM.periodo.addEventListener('change', ()=>{
    // para demo no cambia la fuente de datos, podría filtrar por periodo
    UI.toast('Periodo actualizado', 'info', {sound:false});
  });

  // Logros simples
  function checkAchievements(){
    // ejemplo: logro por superar meta
    const total = state.transacciones.reduce((acc,t)=> acc + (t.tipo === 'ingreso' ? Number(t.monto) : -Number(t.monto)), 0);
    if(total >= state.settings.goalAmount && !state.achievements.includes('ahorrista1')){
      state.achievements.push('ahorrista1');
      DataStore.guardar(state);
      UI.toast('🎉 ¡Logro desbloqueado: Ahorrista Nivel 1!', 'success');
      // añadir elemento a la lista de logros
      const li = document.createElement('li');
      li.textContent = '💎 Ahorrista Nivel 1';
      UI.DOM.achList.appendChild(li);
    }
  }

  // Inicializar lista de logros en UI
  (function initAchievements(){
    if(state.achievements && state.achievements.includes('ahorrista1')){
      const li = document.createElement('li'); li.textContent = '💎 Ahorrista Nivel 1';
      UI.DOM.achList.appendChild(li);
    }
  })();

  // Helper: aplicar tema
  function applyTheme(mode){
    if(mode === 'auto'){
      // usar preferencia del sistema
      const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }

  // Inicial: activar sonidos si están en settings
  if(!state.settings.sounds) UI.DOM.toggleSounds.checked = false;

  // Evento para actualizar UI en cambios externos
  window.addEventListener('storage', (e)=> {
    if(e.key === 'simFin_v1'){
      state = DataStore.cargar();
      UI.renderCategorias(state.categorias);
      actualizarTodo();
    }
  });
});
