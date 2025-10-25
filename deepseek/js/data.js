// =============================================
// MÓDULO DE DATOS - data.js
// Maneja el almacenamiento y gestión de datos
// =============================================

const DataManager = (function() {
    // Categorías predefinidas
    const categorias = [
        { id: 1, nombre: 'Salario', tipo: 'ingreso', icono: '💰', color: '#10b981' },
        { id: 2, nombre: 'Freelance', tipo: 'ingreso', icono: '💼', color: '#10b981' },
        { id: 3, nombre: 'Inversiones', tipo: 'ingreso', icono: '📈', color: '#10b981' },
        { id: 4, nombre: 'Regalos', tipo: 'ingreso', icono: '🎁', color: '#10b981' },
        { id: 5, nombre: 'Alimentación', tipo: 'egreso', icono: '🍕', color: '#ef4444' },
        { id: 6, nombre: 'Transporte', tipo: 'egreso', icono: '🚗', color: '#ef4444' },
        { id: 7, nombre: 'Vivienda', tipo: 'egreso', icono: '🏠', color: '#ef4444' },
        { id: 8, nombre: 'Entretenimiento', tipo: 'egreso', icono: '🎉', color: '#ef4444' },
        { id: 9, nombre: 'Salud', tipo: 'egreso', icono: '🏥', color: '#ef4444' },
        { id: 10, nombre: 'Educación', tipo: 'egreso', icono: '📚', color: '#ef4444' }
    ];

    // Transacciones de ejemplo
    let transacciones = [
        { id: 1, tipo: 'ingreso', categoria: 'Salario', descripcion: 'Pago mensual', monto: 2500, fecha: '2023-06-01', icono: '💰' },
        { id: 2, tipo: 'egreso', categoria: 'Vivienda', descripcion: 'Alquiler', monto: 800, fecha: '2023-06-02', icono: '🏠' },
        { id: 3, tipo: 'egreso', categoria: 'Alimentación', descripcion: 'Supermercado', monto: 150, fecha: '2023-06-03', icono: '🍕' },
        { id: 4, tipo: 'egreso', categoria: 'Transporte', descripcion: 'Gasolina', monto: 60, fecha: '2023-06-04', icono: '🚗' },
        { id: 5, tipo: 'ingreso', categoria: 'Freelance', descripcion: 'Proyecto web', monto: 500, fecha: '2023-06-05', icono: '💼' }
    ];

    // Configuración del usuario
    let configuracion = {
        tema: 'claro',
        color: 'azul',
        sonidos: true,
        metaAhorro: 1000
    };

    // Cargar datos del localStorage
    function cargarDatos() {
        try {
            const datosGuardados = localStorage.getItem('finanzasData');
            if (datosGuardados) {
                const datos = JSON.parse(datosGuardados);
                transacciones = datos.transacciones || transacciones;
                configuracion = datos.configuracion || configuracion;
                console.log('✅ Datos cargados correctamente desde localStorage');
            }
        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
        }
    }

    // Guardar datos en localStorage
    function guardarDatos() {
        try {
            const datos = {
                transacciones,
                configuracion
            };
            localStorage.setItem('finanzasData', JSON.stringify(datos));
            console.log('💾 Datos guardados correctamente en localStorage');
        } catch (error) {
            console.error('❌ Error al guardar datos:', error);
        }
    }

    // Obtener transacciones
    function obtenerTransacciones() {
        return [...transacciones]; // Devolver copia para evitar mutaciones
    }

    // Agregar transacción
    function agregarTransaccion(transaccion) {
        try {
            const categoria = categorias.find(cat => cat.nombre === transaccion.categoria);
            transaccion.id = Date.now();
            transaccion.icono = categoria ? categoria.icono : '💰';
            transacciones.push(transaccion);
            guardarDatos();
            console.log('✅ Transacción agregada:', transaccion);
            return transaccion;
        } catch (error) {
            console.error('❌ Error al agregar transacción:', error);
            throw error;
        }
    }

    // Eliminar transacción
    function eliminarTransaccion(id) {
        try {
            const index = transacciones.findIndex(t => t.id === id);
            if (index !== -1) {
                transacciones.splice(index, 1);
                guardarDatos();
                console.log('🗑️ Transacción eliminada:', id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error al eliminar transacción:', error);
            throw error;
        }
    }

    // Obtener categorías
    function obtenerCategorias() {
        return [...categorias];
    }

    // Obtener categorías por tipo
    function obtenerCategoriasPorTipo(tipo) {
        return categorias.filter(cat => cat.tipo === tipo);
    }

    // Obtener configuración
    function obtenerConfiguracion() {
        return { ...configuracion }; // Devolver copia
    }

    // Actualizar configuración
    function actualizarConfiguracion(nuevaConfig) {
        try {
            configuracion = { ...configuracion, ...nuevaConfig };
            guardarDatos();
            console.log('⚙️ Configuración actualizada:', configuracion);
            return configuracion;
        } catch (error) {
            console.error('❌ Error al actualizar configuración:', error);
            throw error;
        }
    }

    // Calcular resumen financiero
    function calcularResumen() {
        try {
            const ingresos = transacciones
                .filter(t => t.tipo === 'ingreso')
                .reduce((total, t) => total + t.monto, 0);
            
            const egresos = transacciones
                .filter(t => t.tipo === 'egreso')
                .reduce((total, t) => total + t.monto, 0);
            
            const balance = ingresos - egresos;
            
            return {
                ingresos,
                egresos,
                balance
            };
        } catch (error) {
            console.error('❌ Error al calcular resumen:', error);
            return { ingresos: 0, egresos: 0, balance: 0 };
        }
    }

    // Obtener estadísticas mensuales
    function obtenerEstadisticasMensuales() {
        try {
            const ahora = new Date();
            const mesActual = ahora.getMonth();
            const añoActual = ahora.getFullYear();
            
            const transaccionesMes = transacciones.filter(t => {
                const fecha = new Date(t.fecha);
                return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
            });
            
            return {
                transacciones: transaccionesMes,
                totalIngresos: transaccionesMes
                    .filter(t => t.tipo === 'ingreso')
                    .reduce((total, t) => total + t.monto, 0),
                totalEgresos: transaccionesMes
                    .filter(t => t.tipo === 'egreso')
                    .reduce((total, t) => total + t.monto, 0)
            };
        } catch (error) {
            console.error('❌ Error al obtener estadísticas mensuales:', error);
            return { transacciones: [], totalIngresos: 0, totalEgresos: 0 };
        }
    }

    // Inicializar datos
    cargarDatos();

    return {
        obtenerTransacciones,
        agregarTransaccion,
        eliminarTransaccion,
        obtenerCategorias,
        obtenerCategoriasPorTipo,
        obtenerConfiguracion,
        actualizarConfiguracion,
        calcularResumen,
        obtenerEstadisticasMensuales
    };
})();