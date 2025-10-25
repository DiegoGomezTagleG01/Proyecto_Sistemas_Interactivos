// =============================================
// MÓDULO DE SONIDOS - sound-manager.js
// Maneja todos los efectos de sonido del sistema
// =============================================

const SoundManager = (function() {
    // Configuración de sonidos
    let sonidosActivados = true;
    let volumen = 0.7;

    // Sonidos disponibles
    const sonidos = {
        exito: null,
        error: null,
        notificacion: null,
        transaccion: null
    };

    // Inicializar sonidos
    function inicializar() {
        try {
            // En una implementación real, cargaríamos archivos de sonido
            // Por ahora usaremos sonidos base64 simples o silencios
            sonidos.exito = new Howl({
                src: ['assets/sounds/success.mp3'],
                volume: volumen,
                onloaderror: function() {
                    console.warn('No se pudo cargar el sonido de éxito');
                }
            });

            sonidos.error = new Howl({
                src: ['assets/sounds/error.mp3'],
                volume: volumen,
                onloaderror: function() {
                    console.warn('No se pudo cargar el sonido de error');
                }
            });

            sonidos.notificacion = new Howl({
                src: ['assets/sounds/notification.mp3'],
                volume: volumen,
                onloaderror: function() {
                    console.warn('No se pudo cargar el sonido de notificación');
                }
            });

            console.log('🔊 Módulo de sonidos inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar sonidos:', error);
        }
    }

    // Reproducir sonido
    function reproducirSonido(tipo) {
        if (!sonidosActivados) return;

        try {
            const sonido = sonidos[tipo];
            if (sonido) {
                sonido.play();
            }
        } catch (error) {
            console.warn('No se pudo reproducir el sonido:', tipo, error);
        }
    }

    // Activar/desactivar sonidos
    function toggleSonidos(activar) {
        sonidosActivados = activar;
        console.log(activar ? '🔊 Sonidos activados' : '🔇 Sonidos desactivados');
    }

    // Cambiar volumen
    function cambiarVolumen(nuevoVolumen) {
        volumen = Math.max(0, Math.min(1, nuevoVolumen));
        
        // Actualizar volumen de todos los sonidos
        Object.values(sonidos).forEach(sonido => {
            if (sonido) {
                sonido.volume(volumen);
            }
        });
        
        console.log(`🔊 Volumen cambiado a: ${Math.round(volumen * 100)}%`);
    }

    // Obtener estado de sonidos
    function obtenerEstadoSonidos() {
        return {
            activados: sonidosActivados,
            volumen: volumen
        };
    }

    return {
        inicializar,
        reproducirSonido,
        toggleSonidos,
        cambiarVolumen,
        obtenerEstadoSonidos
    };
})();