// =============================================
// MÓDULO DE INTERFAZ - ui.js
// Controla la interfaz de usuario y eventos
// =============================================

const UIManager = (function() {
    // Elementos DOM
    const elementos = {
        // Formulario
        formTransaccion: document.getElementById('formTransaccion'),
        tipoTransaccion: document.getElementById('tipoTransaccion'),
        categoria: document.getElementById('categoria'),
        descripcion: document.getElementById('descripcion'),
        monto: document.getElementById('monto'),
        fecha: document.getElementById('fecha'),
        
        // Resumen
        ingresosTotales: document.getElementById('ingresosTotales'),
        egresosTotales: document.getElementById('egresosTotales'),
        balanceActual: document.getElementById('balanceActual'),
        
        // Lista de transacciones
        listaTransacciones: document.getElementById('listaTransacciones'),
        
        // Gráfico
        graficoFinanzas: document.getElementById('graficoFinanzas'),
        
        // Configuración
        panelConfiguracion: document.getElementById('panelConfiguracion'),
        btnConfiguracion: document.getElementById('btnConfiguracion'),
        cerrarPanel: document.getElementById('cerrarPanel'),
        overlay: document.getElementById('overlay'),
        
        // Toast
        toast: document.getElementById('toast'),
        toastMensaje: document.getElementById('toastMensaje'),
        
        // Logros
        logrosContainer: document.getElementById('logrosContainer'),
        barraProgresoAhorro: document.getElementById('barraProgresoAhorro'),
        ahorroActual: document.getElementById('ahorroActual'),
        metaAhorro: document.getElementById('metaAhorro')
    };

    // Inicializar la interfaz
    function inicializar() {
        configurarEventos();
        actualizarInterfaz();
        aplicarConfiguracion(DataManager.obtenerConfiguracion());
        console.log('🎨 Módulo de interfaz inicializado');
    }

    // Configurar eventos
    function configurarEventos() {
        // Formulario de transacción
        elementos.formTransaccion.addEventListener('submit', manejarEnvioFormulario);
        
        // Cambio en tipo de transacción
        elementos.tipoTransaccion.addEventListener('change', actualizarCategorias);
        
        // Panel de configuración
        elementos.btnConfiguracion.addEventListener('click', mostrarPanelConfiguracion);
        elementos.cerrarPanel.addEventListener('click', ocultarPanelConfiguracion);
        elementos.overlay.addEventListener('click', ocultarPanelConfiguracion);
        
        // Selectores de tema y color
        document.querySelectorAll('.tema-opcion').forEach(opcion => {
            opcion.addEventListener('click', cambiarTema);
        });
        
        document.querySelectorAll('.color-opcion').forEach(opcion => {
            opcion.addEventListener('click', cambiarColor);
        });
        
        // Sonidos
        const checkboxSonidos = document.getElementById('sonidosActivados');
        if (checkboxSonidos) {
            checkboxSonidos.addEventListener('change', toggleSonidos);
        }

        // Eventos de teclado
        document.addEventListener('keydown', manejarTeclado);
        
        console.log('🔄 Eventos de interfaz configurados');
    }

    // Manejar envío del formulario
    function manejarEnvioFormulario(e) {
        e.preventDefault();
        
        const transaccion = {
            tipo: elementos.tipoTransaccion.value,
            categoria: elementos.categoria.value,
            descripcion: elementos.descripcion.value.trim(),
            monto: parseFloat(elementos.monto.value),
            fecha: elementos.fecha.value
        };
        
        // Validar formulario
        if (!validarFormulario(transaccion)) return;
        
        try {
            // Agregar transacción
            DataManager.agregarTransaccion(transaccion);
            
            // Actualizar interfaz
            actualizarInterfaz();
            
            // Mostrar mensaje de éxito
            mostrarToast('¡Transacción guardada exitosamente! 💪', 'exito');
            
            // Reproducir sonido
            SoundManager.reproducirSonido('exito');
            
            // Reiniciar formulario
            elementos.formTransaccion.reset();
            actualizarCategorias();
            
            console.log('✅ Formulario procesado correctamente');
        } catch (error) {
            mostrarToast('Error al guardar la transacción', 'error');
            console.error('❌ Error al procesar formulario:', error);
        }
    }

    // Validar formulario
    function validarFormulario(transaccion) {
        if (!transaccion.tipo) {
            mostrarToast('Por favor, selecciona un tipo de transacción', 'error');
            elementos.tipoTransaccion.focus();
            return false;
        }
        
        if (!transaccion.categoria) {
            mostrarToast('Por favor, selecciona una categoría', 'error');
            elementos.categoria.focus();
            return false;
        }
        
        if (!transaccion.descripcion) {
            mostrarToast('Por favor, ingresa una descripción', 'error');
            elementos.descripcion.focus();
            return false;
        }
        
        if (!transaccion.monto || transaccion.monto <= 0) {
            mostrarToast('Por favor, ingresa un monto válido', 'error');
            elementos.monto.focus();
            return false;
        }
        
        if (!transaccion.fecha) {
            mostrarToast('Por favor, selecciona una fecha', 'error');
            elementos.fecha.focus();
            return false;
        }
        
        return true;
    }

    // Actualizar categorías según el tipo de transacción
    function actualizarCategorias() {
        const tipo = elementos.tipoTransaccion.value;
        const categorias = tipo ? DataManager.obtenerCategoriasPorTipo(tipo) : [];
        
        // Limpiar select
        elementos.categoria.innerHTML = '<option value="">Selecciona una categoría</option>';
        
        // Agregar opciones
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombre;
            option.textContent = `${cat.icono} ${cat.nombre}`;
            elementos.categoria.appendChild(option);
        });
    }

    // Actualizar toda la interfaz
    function actualizarInterfaz() {
        actualizarResumen();
        actualizarListaTransacciones();
        actualizarGrafico();
        actualizarLogros();
        console.log('🔄 Interfaz actualizada');
    }

    // Actualizar resumen financiero
    function actualizarResumen() {
        const resumen = DataManager.calcularResumen();
        
        elementos.ingresosTotales.textContent = `$${resumen.ingresos.toFixed(2)}`;
        elementos.egresosTotales.textContent = `$${resumen.egresos.toFixed(2)}`;
        elementos.balanceActual.textContent = `$${resumen.balance.toFixed(2)}`;
        
        // Cambiar color del balance según sea positivo o negativo
        if (resumen.balance < 0) {
            elementos.balanceActual.style.color = 'var(--color-egreso)';
            mostrarToast('⚠️ Cuidado, tu balance es negativo', 'advertencia');
        } else {
            elementos.balanceActual.style.color = 'var(--color-primario)';
        }

        // Mensajes motivacionales basados en el balance
        if (resumen.balance > 1000) {
            mostrarToast('💎 ¡Excelente! Tu ahorro es impresionante', 'exito');
        } else if (resumen.balance > 0) {
            mostrarToast('💪 ¡Vas muy bien, sigue ahorrando!', 'exito');
        }
    }

    // Actualizar lista de transacciones
    function actualizarListaTransacciones() {
        const transacciones = DataManager.obtenerTransacciones();
        
        // Ordenar por fecha (más reciente primero)
        transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Limpiar lista
        elementos.listaTransacciones.innerHTML = '';
        
        if (transacciones.length === 0) {
            elementos.listaTransacciones.innerHTML = `
                <div class="transaccion vacia">
                    <div class="transaccion-info">
                        <div class="transaccion-icono">📝</div>
                        <div class="transaccion-descripcion">
                            <h4>No hay transacciones registradas</h4>
                            <p>Comienza agregando tu primera transacción</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Agregar transacciones
        transacciones.forEach(transaccion => {
            const elemento = crearElementoTransaccion(transaccion);
            elementos.listaTransacciones.appendChild(elemento);
        });
    }

    // Crear elemento de transacción
    function crearElementoTransaccion(transaccion) {
        const div = document.createElement('div');
        div.className = `transaccion transaccion-${transaccion.tipo} nuevo-elemento`;
        
        const fechaFormateada = new Date(transaccion.fecha).toLocaleDateString('es-ES');
        
        div.innerHTML = `
            <div class="transaccion-info">
                <div class="transaccion-icono">${transaccion.icono}</div>
                <div class="transaccion-descripcion">
                    <h4>${transaccion.descripcion}</h4>
                    <p>${transaccion.categoria} • ${fechaFormateada}</p>
                </div>
            </div>
            <div class="transaccion-monto">
                ${transaccion.tipo === 'ingreso' ? '+' : '-'}$${transaccion.monto.toFixed(2)}
            </div>
        `;
        
        return div;
    }

    // Actualizar gráfico
    function actualizarGrafico() {
        const resumen = DataManager.calcularResumen();
        const transacciones = DataManager.obtenerTransacciones();
        const datosCategorias = ChartManager.generarDatosCategorias(transacciones);
        
        // Inicializar gráfico si no existe
        if (!window.graficoFinanzas) {
            const ctx = elementos.graficoFinanzas.getContext('2d');
            window.graficoFinanzas = ChartManager.inicializarGraficoFinanzas(ctx);
        }
        
        // Actualizar gráfico
        ChartManager.actualizarGraficoFinanzas({
            ingresos: resumen.ingresos,
            egresos: resumen.egresos,
            datosCategorias: datosCategorias.length > 0 ? datosCategorias : null
        });
    }

    // Actualizar logros y gamificación
    function actualizarLogros() {
        const resumen = DataManager.calcularResumen();
        const config = DataManager.obtenerConfiguracion();
        
        // Actualizar barra de progreso de ahorro
        const porcentajeAhorro = Math.min((resumen.balance / config.metaAhorro) * 100, 100);
        elementos.barraProgresoAhorro.style.width = `${porcentajeAhorro}%`;
        elementos.ahorroActual.textContent = `$${Math.max(resumen.balance, 0).toFixed(2)}`;
        elementos.metaAhorro.textContent = `Meta: $${config.metaAhorro}`;
        
        // Generar logros
        elementos.logrosContainer.innerHTML = '';
        
        const logros = [
            {
                icono: '💰',
                titulo: 'Primer Ahorro',
                descripcion: 'Has alcanzado tu primer ahorro',
                completado: resumen.balance > 0,
                nivel: 1
            },
            {
                icono: '📈',
                titulo: 'Ahorrador Nivel 1',
                descripcion: 'Has ahorrado más de $500',
                completado: resumen.balance >= 500,
                nivel: 2
            },
            {
                icono: '💎',
                titulo: 'Ahorrador Nivel 2',
                descripcion: 'Has ahorrado más de $1,000',
                completado: resumen.balance >= 1000,
                nivel: 3
            },
            {
                icono: '🏆',
                titulo: 'Control de Gastos',
                descripcion: 'Mantén tus gastos por debajo del 70% de tus ingresos',
                completado: resumen.egresos <= resumen.ingresos * 0.7,
                nivel: 2
            }
        ];
        
        logros.forEach(logro => {
            const elemento = document.createElement('div');
            elemento.className = `logro ${logro.completado ? 'logro-desbloqueado' : ''}`;
            
            if (logro.completado) {
                elemento.style.opacity = '1';
            } else {
                elemento.style.opacity = '0.6';
            }
            
            elemento.innerHTML = `
                <div class="logro-icono">${logro.icono}</div>
                <div class="logro-info">
                    <h4>${logro.titulo}</h4>
                    <p>${logro.descripcion}</p>
                </div>
                <div class="logro-estado">
                    ${logro.completado ? 
                        '<i class="fas fa-check-circle" style="color: var(--color-ingreso);"></i>' : 
                        `<span class="nivel-indicador">Nivel ${logro.nivel}</span>`
                    }
                </div>
            `;
            
            elementos.logrosContainer.appendChild(elemento);
        });
    }

    // Mostrar panel de configuración
    function mostrarPanelConfiguracion() {
        elementos.panelConfiguracion.classList.add('activo');
        elementos.overlay.classList.add('activo');
        document.body.style.overflow = 'hidden';
        SoundManager.reproducirSonido('notificacion');
    }

    // Ocultar panel de configuración
    function ocultarPanelConfiguracion() {
        elementos.panelConfiguracion.classList.remove('activo');
        elementos.overlay.classList.remove('activo');
        document.body.style.overflow = 'auto';
    }

    // Cambiar tema
    function cambiarTema(e) {
        const tema = e.currentTarget.dataset.tema;
        
        // Actualizar clases activas
        document.querySelectorAll('.tema-opcion').forEach(opcion => {
            opcion.classList.remove('activo');
        });
        e.currentTarget.classList.add('activo');
        
        // Aplicar tema
        document.body.className = '';
        if (tema === 'oscuro') {
            document.body.classList.add('modo-oscuro');
        }
        
        // Guardar configuración
        DataManager.actualizarConfiguracion({ tema });
        SoundManager.reproducirSonido('exito');
    }

    // Cambiar color
    function cambiarColor(e) {
        const color = e.currentTarget.dataset.color;
        
        // Actualizar clases activas
        document.querySelectorAll('.color-opcion').forEach(opcion => {
            opcion.classList.remove('activo');
        });
        e.currentTarget.classList.add('activo');
        
        // Aplicar color
        document.body.classList.remove(
            'tema-azul', 'tema-verde', 'tema-purpura', 
            'tema-ambar', 'tema-rojo', 'tema-rosa'
        );
        document.body.classList.add(`tema-${color}`);
        
        // Guardar configuración
        DataManager.actualizarConfiguracion({ color });
        SoundManager.reproducirSonido('exito');
    }

    // Activar/desactivar sonidos
    function toggleSonidos(e) {
        SoundManager.toggleSonidos(e.target.checked);
        DataManager.actualizarConfiguracion({ sonidos: e.target.checked });
    }

    // Aplicar configuración
    function aplicarConfiguracion(config) {
        // Aplicar tema
        document.body.className = '';
        if (config.tema === 'oscuro') {
            document.body.classList.add('modo-oscuro');
            document.querySelector('[data-tema="oscuro"]').classList.add('activo');
            document.querySelector('[data-tema="claro"]').classList.remove('activo');
        } else {
            document.querySelector('[data-tema="claro"]').classList.add('activo');
            document.querySelector('[data-tema="oscuro"]').classList.remove('activo');
        }
        
        // Aplicar color
        document.body.classList.add(`tema-${config.color}`);
        document.querySelectorAll('.color-opcion').forEach(opcion => {
            opcion.classList.remove('activo');
        });
        document.querySelector(`[data-color="${config.color}"]`).classList.add('activo');
        
        // Aplicar configuración de sonidos
        const checkboxSonidos = document.getElementById('sonidosActivados');
        if (checkboxSonidos) {
            checkboxSonidos.checked = config.sonidos;
            SoundManager.toggleSonidos(config.sonidos);
        }
    }

    // Mostrar toast
    function mostrarToast(mensaje, tipo = 'exito') {
        elementos.toastMensaje.textContent = mensaje;
        elementos.toast.className = `toast ${tipo}`;
        elementos.toast.classList.add('mostrar');
        
        setTimeout(() => {
            elementos.toast.classList.remove('mostrar');
        }, 3000);
    }

    // Manejar eventos de teclado
    function manejarTeclado(e) {
        // ESC para cerrar panel de configuración
        if (e.key === 'Escape' && elementos.panelConfiguracion.classList.contains('activo')) {
            ocultarPanelConfiguracion();
        }
        
        // Ctrl+N para nueva transacción
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            elementos.formTransaccion.scrollIntoView({ behavior: 'smooth' });
            elementos.descripcion.focus();
        }
    }

    return {
        inicializar,
        mostrarToast,
        actualizarInterfaz
    };
})();