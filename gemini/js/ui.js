/**
 * ui.js: Módulo para el control del DOM, renderizado, eventos y animaciones.
 */
import { obtenerEstado, obtenerCategorias, obtenerMetas, guardarDatos } from './data.js';

// --- ELEMENTOS DEL DOM ---
const $balanceTotal = document.getElementById('balance-total');
const $listaTransacciones = document.getElementById('lista-transacciones');
const $formTransaccion = document.getElementById('form-transaccion');
const $selectCategoria = document.getElementById('categoria');
const $configPanel = document.getElementById('config-panel');
const $btnConfig = document.getElementById('btn-config');
const $btnCerrarConfig = document.getElementById('btn-cerrar-config');
const $appContainer = document.getElementById('app-container');
const $toastContainer = document.getElementById('toast-container');
const $progresoMeta = document.getElementById('progreso-meta');
const $progresoTexto = document.getElementById('progreso-texto');
const $nivelUsuario = document.getElementById('nivel-usuario');
const $modoTema = document.getElementById('modo-tema');
const $colorPrincipal = document.getElementById('color-principal');

// --- GRÁFICOS Y SONIDOS (Declaraciones para ser inicializadas en app.js) ---
let graficoBalance;
let soundSuccess;
let soundAlert;

/**
 * Rellena el select de categorías basado en el tipo de transacción.
 * @param {string} tipo - 'ingreso' o 'egreso'.
 */
const renderizarCategorias = (tipo) => {
    const categorias = obtenerCategorias();
    const categoriasFiltradas = tipo === 'ingreso' ? categorias.ingresos : categorias.egresos;
    
    // Limpiar y añadir la opción por defecto
    $selectCategoria.innerHTML = '<option value="">Seleccione...</option>';

    // Crear las opciones con emojis
    categoriasFiltradas.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icono} ${cat.nombre}`;
        $selectCategoria.appendChild(option);
    });
};

/**
 * Actualiza el Balance Total en la UI y aplica animaciones de retroalimentación.
 */
const actualizarBalanceUI = () => {
    const { balance } = obtenerEstado();
    $balanceTotal.textContent = `$${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    // Remover clases de estado previas
    $balanceTotal.classList.remove('balance-positivo', 'balance-negativo', 'balance-cero');

    // Aplicar clase de color y animación
    if (balance > 0) {
        $balanceTotal.classList.add('balance-positivo');
    } else if (balance < 0) {
        $balanceTotal.classList.add('balance-negativo');
    } else {
        $balanceTotal.classList.add('balance-cero');
    }
    
    // Animación de "rebote" para dar feedback dinámico
    $balanceTotal.classList.add('balance-bounce');
    setTimeout(() => $balanceTotal.classList.remove('balance-bounce'), 300);
};

/**
 * Renderiza la lista de transacciones recientes.
 */
const renderizarTransacciones = () => {
    const { transacciones } = obtenerEstado();
    $listaTransacciones.innerHTML = ''; // Limpiar lista

    if (transacciones.length === 0) {
        $listaTransacciones.innerHTML = '<li class="placeholder">Aún no hay transacciones.</li>';
        return;
    }

    // Mostrar solo las 10 más recientes
    transacciones.slice(0, 10).forEach(trans => {
        const li = document.createElement('li');
        const categorias = obtenerCategorias();
        const cats = trans.tipo === 'ingreso' ? categorias.ingresos : categorias.egresos;
        const categoriaInfo = cats.find(c => c.id === trans.categoria);
        const icono = categoriaInfo ? categoriaInfo.icono : (trans.tipo === 'ingreso' ? '➕' : '➖');

        li.innerHTML = `
            <span class="trans-detalle">${icono} ${trans.descripcion || 'Sin descripción'}</span>
            <span class="trans-monto trans-${trans.tipo}">
                ${trans.tipo === 'ingreso' ? '+' : '-'} $${trans.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
        `;
        $listaTransacciones.appendChild(li);
    });
};

/**
 * Muestra un mensaje "toast" animado y motivacional.
 * @param {string} mensaje - El texto a mostrar.
 * @param {string} tipo - 'ingreso' o 'egreso' para aplicar color y sonido.
 */
const mostrarToast = (mensaje, tipo) => {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    $toastContainer.appendChild(toast);

    // Reproducir sonido
    if (tipo === 'ingreso' && soundSuccess) {
        soundSuccess.play();
    } else if (tipo === 'egreso' && soundAlert) {
        soundAlert.play();
    }
    
    // Mostrar y desaparecer después de un tiempo
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 4000); // 4 segundos
};


/**
 * Actualiza la gráfica de evolución del balance (Chart.js).
 */
const actualizarGrafico = () => {
    const { transacciones } = obtenerEstado();
    
    // Calcular el balance acumulado a lo largo del tiempo
    let balanceAcumulado = 0;
    const datosGrafico = transacciones.slice().reverse().map(trans => {
        const monto = parseFloat(trans.monto);
        balanceAcumulado += trans.tipo === 'ingreso' ? monto : -monto;
        return {
            x: new Date(trans.fecha),
            y: parseFloat(balanceAcumulado.toFixed(2))
        };
    });

    const etiquetas = datosGrafico.map(d => d.x.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }));
    const dataPuntos = datosGrafico.map(d => d.y);
    
    if (graficoBalance) {
        // Actualizar datos si el gráfico ya existe
        graficoBalance.data.labels = etiquetas;
        graficoBalance.data.datasets[0].data = dataPuntos;
        graficoBalance.update(); // Animación de actualización por defecto de Chart.js
    } else {
        // Inicializar el gráfico (solo ocurre la primera vez)
        const ctx = document.getElementById('grafico-balance').getContext('2d');
        graficoBalance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Balance Acumulado ($)',
                    data: dataPuntos,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'var(--color-principal)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
};

/**
 * Actualiza los elementos de Gamificación (Progreso de Meta y Nivel).
 */
const actualizarGamificacion = () => {
    const { balance } = obtenerEstado();
    const metas = obtenerMetas();

    // 1. Meta de Ahorro
    let porcentaje = (balance / metas.meta_ahorro) * 100;
    porcentaje = Math.max(0, Math.min(100, porcentaje)); // Limitar entre 0 y 100
    
    $progresoMeta.style.width = `${porcentaje}%`;
    $progresoTexto.textContent = `${porcentaje.toFixed(1)}% Completado ($${balance.toLocaleString('es-MX')}/$${metas.meta_ahorro.toLocaleString('es-MX')})`;

    // 2. Nivel
    let nivel = '💎 Ahorrista Nivel 1';
    if (balance >= metas.nivel_3) {
        nivel = '🏆 Maestro Financiero Nivel 3';
    } else if (balance >= metas.nivel_2) {
        nivel = '🌟 Presupuestador Nivel 2';
    }
    $nivelUsuario.textContent = nivel;
};


// --- EVENTOS DE INTERFAZ Y CONFIGURACIÓN ---

/**
 * Toggle para mostrar/ocultar el panel de configuración.
 */
const toggleConfigPanel = () => {
    $configPanel.classList.toggle('visible');
};

/**
 * Aplica el modo oscuro/claro y guarda la preferencia.
 */
const aplicarTema = () => {
    const isDarkMode = $modoTema.checked;
    $appContainer.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('tema_oscuro', isDarkMode ? 'true' : 'false');
};

/**
 * Aplica el color principal dinámico y guarda la preferencia.
 * @param {string} color - Código de color HEX.
 */
const aplicarColorPrincipal = (color) => {
    document.documentElement.style.setProperty('--color-principal', color);
    localStorage.setItem('color_principal', color);
};

/**
 * Carga las preferencias de tema guardadas al inicio.
 */
const cargarPreferenciasTema = () => {
    // Modo Oscuro
    const storedDarkMode = localStorage.getItem('tema_oscuro') === 'true';
    $modoTema.checked = storedDarkMode;
    $appContainer.classList.toggle('dark-mode', storedDarkMode);
    
    // Color Principal
    const storedColor = localStorage.getItem('color_principal') || '#4CAF50';
    $colorPrincipal.value = storedColor;
    aplicarColorPrincipal(storedColor);
};


// --- INICIALIZACIÓN DE LISTENERS ---

/**
 * Asigna los listeners de eventos a los elementos del DOM.
 */
const initUIListerners = () => {
    // Renderizar categorías al cargar (por defecto para 'egreso' para que aparezca algo)
    renderizarCategorias(document.getElementById('tipo').value);
    
    // Listener para cambiar las categorías al cambiar el tipo
    document.getElementById('tipo').addEventListener('change', (e) => {
        renderizarCategorias(e.target.value);
    });

    // Eventos de Toggle de Configuración
    $btnConfig.addEventListener('click', toggleConfigPanel);
    $btnCerrarConfig.addEventListener('click', toggleConfigPanel);
    
    // Eventos de personalización
    $modoTema.addEventListener('change', aplicarTema);
    $colorPrincipal.addEventListener('input', (e) => aplicarColorPrincipal(e.target.value));
    
    // Evento de Resetear Datos (Requiere confirmación, guarda el estado vacío)
    document.getElementById('btn-reset-data').addEventListener('click', () => {
        if (confirm('⚠️ ¿Estás seguro de que quieres resetear TODOS tus datos financieros? Esta acción es irreversible.')) {
            localStorage.removeItem('finanzas_data');
            window.location.reload(); // Recargar la app
        }
    });

    // Cargar las preferencias de tema al inicio
    cargarPreferenciasTema();
};

/**
 * Función para actualizar toda la UI después de un cambio de estado.
 */
const actualizarTodaLaUI = () => {
    actualizarBalanceUI();
    renderizarTransacciones();
    actualizarGrafico();
    actualizarGamificacion();
};

// Exportar funciones para uso externo (en app.js)
export { 
    initUIListerners, 
    actualizarTodaLaUI, 
    mostrarToast, 
    graficoBalance, 
    soundSuccess, 
    soundAlert 
};