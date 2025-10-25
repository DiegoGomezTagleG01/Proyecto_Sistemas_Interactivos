/**
 * data.js: Módulo para el manejo de datos, LocalStorage y lógica central del estado.
 */

// Clave de LocalStorage para almacenar las transacciones
const LS_KEY = 'finanzas_data';
// Metas predefinidas para la gamificación
const METAS = {
    meta_ahorro: 10000,
    nivel_1: 0,
    nivel_2: 2000,
    nivel_3: 5000
};

// Objeto que almacena el estado de la aplicación
let estadoFinanciero = {
    transacciones: [],
    balance: 0,
    categorias: {}
};

/**
 * Carga los datos iniciales de LocalStorage.
 * @returns {void}
 */
const cargarDatos = () => {
    try {
        const dataGuardada = localStorage.getItem(LS_KEY);
        if (dataGuardada) {
            estadoFinanciero = JSON.parse(dataGuardada);
        } else {
            // Inicializar con estructura vacía si no hay datos
            estadoFinanciero.transacciones = [];
            estadoFinanciero.balance = 0;
        }
    } catch (error) {
        console.error("Error al cargar datos de LocalStorage:", error);
    }
};

/**
 * Guarda el estado actual de la aplicación en LocalStorage.
 * @returns {void}
 */
const guardarDatos = () => {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(estadoFinanciero));
    } catch (error) {
        console.error("Error al guardar datos en LocalStorage:", error);
    }
};

/**
 * Calcula y actualiza el balance total y el estado de salud financiera.
 * @returns {void}
 */
const calcularBalance = () => {
    estadoFinanciero.balance = estadoFinanciero.transacciones.reduce((acc, trans) => {
        const monto = parseFloat(trans.monto);
        return trans.tipo === 'ingreso' ? acc + monto : acc - monto;
    }, 0);
    // Asegura dos decimales
    estadoFinanciero.balance = parseFloat(estadoFinanciero.balance.toFixed(2));
};

/**
 * Añade una nueva transacción al estado y actualiza el balance.
 * @param {object} transaccion - Objeto con {tipo, monto, categoria, descripcion}
 * @returns {void}
 */
const agregarTransaccion = (transaccion) => {
    // Añadir timestamp para ordenar y Chart.js
    const nuevaTransaccion = { 
        ...transaccion, 
        id: Date.now(), 
        fecha: new Date().toISOString() 
    };
    estadoFinanciero.transacciones.unshift(nuevaTransaccion); // Añadir al inicio para historial
    calcularBalance();
    guardarDatos();
};

/**
 * Retorna las categorías predefinidas (simulando una carga de categories.json).
 * @returns {object} - Objeto con arrays de ingresos y egresos.
 */
const obtenerCategorias = () => {
    // En una aplicación real, se usaría fetch() para categories.json
    return {
        ingresos: [
            {id: "salario", nombre: "Salario", icono: "💰"},
            {id: "inversion", nombre: "Inversión", icono: "📈"},
            {id: "regalo", nombre: "Regalo", icono: "🎁"},
            {id: "extra", nombre: "Ingreso Extra", icono: "✨"}
        ],
        egresos: [
            {id: "renta", nombre: "Renta/Hipoteca", icono: "🏠"},
            {id: "comida", nombre: "Comida/Mercado", icono: "🍕"},
            {id: "transporte", nombre: "Transporte", icono: "🚗"},
            {id: "entretenimiento", nombre: "Entretenimiento", icono: "🎉"},
            {id: "servicios", nombre: "Servicios", icono: "💡"},
            {id: "ropa", nombre: "Ropa", icono: "👕"}
        ]
    };
};

/**
 * Devuelve el estado financiero actual.
 * @returns {object} - El estado completo.
 */
const obtenerEstado = () => estadoFinanciero;

/**
 * Devuelve las metas de gamificación.
 * @returns {object} - Las metas predefinidas.
 */
const obtenerMetas = () => METAS;

// Exportar las funciones públicas
export { 
    cargarDatos, 
    agregarTransaccion, 
    obtenerEstado, 
    obtenerCategorias,
    obtenerMetas,
    calcularBalance,
    guardarDatos // Usado para funciones de configuración
};