/* ui.js
   Control de la interfaz (DOM), toasts, sonidos y pequeñas utilidades.
   Comentarios en español.
*/

const UI = (function(){
  // Referencias DOM
  const DOM = {
    form: document.getElementById('formTrans'),
    tipo: document.getElementById('tipo'),
    monto: document.getElementById('monto'),
    categoria: document.getElementById('categoria'),
    fecha: document.getElementById('fecha'),
    nota: document.getElementById('nota'),
    listaTrans: document.getElementById('listaTrans'),
    balance: document.getElementById('balance'),
    statusMessage: document.getElementById('statusMessage'),
    btnSettings: document.getElementById('btnSettings'),
    panelSettings: document.getElementById('panelSettings'),
    closeSettings: document.getElementById('closeSettings'),
    btnToggleTheme: document.getElementById('btnToggleTheme'),
    themeSelect: document.getElementById('themeSelect'),
    accentColor: document.getElementById('accentColor'),
    toggleSounds: document.getElementById('toggleSounds'),
    toaster: document.getElementById('toaster'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    newCatEmoji: document.getElementById('newCatEmoji'),
    newCatName: document.getElementById('newCatName'),
    catsList: document.getElementById('catsList'),
    periodo: document.getElementById('periodo'),
    goalAmount: document.getElementById('goalAmount'),
    progressFill: document.getElementById('progressFill'),
    achList: document.getElementById('achList')
  };

  // Sonidos (Howler)
  const sonidos = {
    success: new Howl({src: ['assets/sounds/success.mp3'], volume: 0.5}),
    warn: new Howl({src: ['assets/sounds/warn.mp3'], volume: 0.5}),
    click: new Howl({src: ['assets/sounds/click.mp3'], volume: 0.35})
  };

  // Mostrar toast
  function toast(text, type='info', opts={sound:true}){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    DOM.toaster.appendChild(t);
    setTimeout(()=> t.classList.add('visible'), 10);
    setTimeout(()=> {
      t.classList.remove('visible');
      t.addEventListener('transitionend', ()=> t.remove(), {once:true});
      t.remove();
    }, 3500);
    // sonido opcional
    if(opts.sound && DOM.toggleSounds.checked){
      if(type === 'success') sonidos.success.play();
      if(type === 'warn') sonidos.warn.play();
      if(type === 'click') sonidos.click.play();
    }
  }

  // Actualizar lista de categorías en select y manager
  function renderCategorias(categorias){
    // llenar select filtrando por tipo seleccionado en formulario
    DOM.categoria.innerHTML = '';
    categorias.forEach(cat=>{
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.emoji} ${cat.nombre}`;
      DOM.categoria.appendChild(opt);
    });

    // manager lista
    DOM.catsList.innerHTML = '';
    categorias.forEach(cat=>{
      const li = document.createElement('li');
      li.textContent = `${cat.emoji} ${cat.nombre} (${cat.tipo}) `;
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Eliminar';
      btn.onclick = ()=> {
        // delega la acción al app (evento)
        document.dispatchEvent(new CustomEvent('ui:deleteCategory', {detail:{id:cat.id}}));
      };
      li.appendChild(btn);
      DOM.catsList.appendChild(li);
    });
  }

  // Render lista transacciones
  function renderTransacciones(transacciones, categorias){
    DOM.listaTrans.innerHTML = '';
    // ordenar por fecha más reciente
    const orden = [...transacciones].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    orden.forEach(t=>{
      const li = document.createElement('li');
      li.className = `trans-item ${t.tipo}`;
      const cat = categorias.find(c=>c.id === t.categoriaId) || {};
      li.innerHTML = `
        <div class="trans-left">
          <div class="trans-emoji">${cat.emoji || '❔'}</div>
          <div class="trans-meta">
            <div class="trans-title">${cat.nombre || 'Sin categoría'} · <span class="muted small">${t.nota || ''}</span></div>
            <div class="muted small">${new Date(t.fecha || t.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div class="trans-right">
          <div class="trans-amount">${t.tipo === 'ingreso' ? '+' : '-'} MXN ${Number(t.monto).toFixed(2)}</div>
          <div class="trans-actions">
            <button class="btn" data-id="${t.id}" data-action="edit">✏️</button>
            <button class="btn" data-id="${t.id}" data-action="delete">🗑️</button>
          </div>
        </div>
      `;
      // Delegación de acciones botones
      li.querySelectorAll('button').forEach(b=>{
        b.addEventListener('click', (e)=>{
          const id = b.dataset.id;
          if(b.dataset.action === 'delete'){
            document.dispatchEvent(new CustomEvent('ui:deleteTransaction', {detail:{id}}));
          }else if(b.dataset.action === 'edit'){
            document.dispatchEvent(new CustomEvent('ui:editTransaction', {detail:{id}}));
          }
        });
      });
      DOM.listaTrans.appendChild(li);
    });
  }

  // Actualiza balance y mensaje de estado
  function renderBalance(balance, settings){
    DOM.balance.textContent = `MXN ${balance.toFixed(2)}`;
    // Mensaje motivacional según umbrales
    let msg = '💪 ¡Vas muy bien, sigue ahorrando!';
    if(balance < settings.thresholds.warn) msg = '⚠️ Cuidado, tus gastos aumentaron esta semana.';
    if(balance >= settings.thresholds.safe) msg = '🟢 Finanzas saludables — buen trabajo!';
    DOM.statusMessage.textContent = msg;
    // color del balance
    if(balance >= 0) DOM.balance.style.color = 'var(--color-ingreso)';
    else DOM.balance.style.color = 'var(--color-egreso)';
  }

  // Actualizar progreso de meta
  function renderProgress(current, goal){
    const pct = Math.min(100, Math.round((current/goal)*100));
    DOM.progressFill.style.width = pct + '%';
    DOM.goalAmount.textContent = `MXN ${goal.toFixed(2)}`;
  }

  // Exponer algunas utilidades y elementos
  return {
    DOM,
    toast,
    renderCategorias,
    renderTransacciones,
    renderBalance,
    renderProgress
  };
})();
