// =============================================
// MÓDULO PRINCIPAL - app.js
// Coordina todos los módulos de la aplicación
// =============================================

const App = (function() {
    // Estado de la aplicación
    let estado = {
        inicializada: false,
        cargando: false
    };

    // Inicializar la aplicación
    function inicializar() {
        if (estado.inicializada) {
            console.warn('⚠️ La aplicación ya está inicializada');
            return;
        }

        estado.cargando = true;
        console.log('🚀 Inicializando Simulador de Finanzas Personales...');

        try {
            // Establecer fecha actual como valor predeterminado
            const hoy = new Date().toISOString().split('T')[0];
            document.getElementById('fecha').value = hoy;
            
            // Inicializar módulos
            SoundManager.inicializar();
            UIManager.inicializar();
            
            // Marcar como inicializada
            estado.inicializada = true;
            estado.cargando = false;
            
            // Mostrar mensaje de bienvenida
            setTimeout(() => {
                UIManager.mostrarToast('¡Bienvenido a tu simulador de finanzas! 💰', 'exito');
                SoundManager.reproducirSonido('notificacion');
            }, 1000);
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            estado.cargando = false;
            console.error('❌ Error al inicializar la aplicación:', error);
            UIManager.mostrarToast('Error al inicializar la aplicación', 'error');
        }
    }

    // Reiniciar aplicación
    function reiniciar() {
        console.log('🔄 Reiniciando aplicación...');
        
        // Limpiar datos
        localStorage.removeItem('finanzasData');
        
        // Recargar página
        window.location.reload();
    }

    // Exportar datos
    function exportarDatos() {
        try {
            const datos = {
                transacciones: DataManager.obtenerTransacciones(),
                configuracion: DataManager.obtenerConfiguracion(),
                fechaExportacion: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(datos, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finanzas-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            UIManager.mostrarToast('Datos exportados correctamente', 'exito');
            console.log('📤 Datos exportados:', datos);
            
        } catch (error) {
            console.error('❌ Error al exportar datos:', error);
            UIManager.mostrarToast('Error al exportar datos', 'error');
        }
    }

    // Importar datos
    function importarDatos(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
                    
                    // Validar estructura de datos
                    if (!datos.transacciones || !datos.configuracion) {
                        throw new Error('Formato de archivo inválido');
                    }
                    
                    // Guardar datos
                    localStorage.setItem('finanzasData', JSON.stringify(datos));
                    
                    // Recargar aplicación
                    reiniciar();
                    resolve(datos);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(archivo);
        });
    }

    // Obtener estado de la aplicación
    function obtenerEstado() {
        return { ...estado };
    }

    // Manejar errores globales
    function configurarManejoErrores() {
        window.addEventListener('error', function(e) {
            console.error('💥 Error global:', e.error);
            UIManager.mostrarToast('Ha ocurrido un error inesperado', 'error');
        });
        
        window.addEventListener('unhandledrejection', function(e) {
            console.error('💥 Promise rechazada:', e.reason);
            UIManager.mostrarToast('Error en operación asíncrona', 'error');
        });
    }

    return {
        inicializar,
        reiniciar,
        exportarDatos,
        importarDatos,
        obtenerEstado,
        configurarManejoErrores
    };
})();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar manejo de errores
    App.configurarManejoErrores();
    
    // Inicializar aplicación
    App.inicializar();
    
    // Exponer App globalmente para desarrollo (remover en producción)
    window.App = App;
});

// Manejar cierre de la página
window.addEventListener('beforeunload', function() {
    console.log('👋 Cerrando aplicación...');
    // Aquí podríamos guardar datos pendientes si fuera necesario
});