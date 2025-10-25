/**
 * app.js: Archivo principal que coordina los módulos de Data y UI.
 * Contiene la lógica de inicialización y el manejador del formulario.
 */
import { cargarDatos, agregarTransaccion, obtenerEstado, calcularBalance } from './data.js';
import { 
    initUIListerners, 
    actualizarTodaLaUI, 
    mostrarToast, 
    graficoBalance, 
    soundSuccess, 
    soundAlert 
} from './ui.js';

// --- INICIALIZACIÓN DE LIBRERÍAS EXTERNAS ---

// Inicialización de Howler.js (Sonidos - Asumiendo que los archivos están en assets/sounds)
const initSounds = () => {
    // soundSuccess = new Howl({ src: ['assets/sounds/success.mp3'] }); // Descomentar al tener el archivo
    // soundAlert = new Howl({ src: ['assets/sounds/alert.mp3'] });     // Descomentar al tener el archivo
    
    // Simulando sonidos con un console.log para la demo
    console.log("Howler.js inicializado. Sonidos de éxito/alerta listos.");
};


// --- CONTROL DEL FORMULARIO ---

/**
 * Manejador del evento de envío del formulario de transacción.
 * @param {Event} e - Evento de envío del formulario.
 */
const manejarEnvioFormulario = (e) => {
    e.preventDefault();
    
    const $form = e.target;
    const tipo = $form.tipo.value;
    const monto = parseFloat($form.monto.value);
    const categoria = $form.categoria.value;
    const descripcion = $form.descripcion.value || (tipo === 'ingreso' ? 'Ingreso registrado' : 'Gasto registrado');
    
    // Validación básica
    if (isNaN(monto) || monto <= 0 || !tipo || !categoria) {
        mostrarToast('❌ Por favor, ingresa un monto válido y selecciona una categoría.', 'egreso');
        return;
    }
    
    // Crear objeto de transacción
    const nuevaTransaccion = { tipo, monto, categoria, descripcion };

    // 1. Actualizar el estado (data.js)
    agregarTransaccion(nuevaTransaccion);
    
    // 2. Determinar mensaje motivacional y tipo de alerta
    let mensajeToast = '';
    if (tipo === 'ingreso') {
        const estado = obtenerEstado();
        mensajeToast = estado.balance > 0 
            ? `💰 ¡Ingreso registrado! 💪 ¡Vas muy bien, Balance: $${estado.balance.toLocaleString('es-MX')}!`
            : `➕ Ingreso registrado. ¡Sigue así para salir del rojo!`;
    } else {
        const estado = obtenerEstado();
        mensajeToast = estado.balance < 0 
            ? `🚨 Gasto de -$${monto.toLocaleString('es-MX')}. Cuidado, tu balance es negativo.`
            : `💸 Gasto registrado. Tu saldo actual es $${estado.balance.toLocaleString('es-MX')}.`;
    }
    
    // 3. Actualizar la interfaz (ui.js) y mostrar retroalimentación
    actualizarTodaLaUI();
    mostrarToast(mensajeToast, tipo);
    
    // 4. Limpiar formulario
    $form.reset();
    document.getElementById('tipo').dispatchEvent(new Event('change')); // Recargar categorías al limpiar
};


// --- INICIALIZACIÓN DE LA APLICACIÓN ---

/**
 * Función principal que inicia todo el sistema.
 */
const initApp = () => {
    console.log("🚀 Iniciando Simulador Interactivo de Finanzas Personales...");

    // 1. Cargar datos desde LocalStorage (o inicializar)
    cargarDatos();

    // 2. Inicializar listeners de UI (incluyendo formulario y configuración)
    initUIListerners();

    // 3. Asignar listener de envío de formulario
    document.getElementById('form-transaccion').addEventListener('submit', manejarEnvioFormulario);

    // 4. Inicializar sonidos (Howler.js)
    initSounds();

    // 5. Renderizar la UI inicial
    actualizarTodaLaUI();

    console.log("✅ Aplicación inicializada. Estado actual:", obtenerEstado());
};

// Ejecutar la función de inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initApp);