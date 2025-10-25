// =============================================
// MÓDULO DE GRÁFICOS - chart-manager.js
// Maneja la creación y actualización de gráficos
// =============================================

const ChartManager = (function() {
    let graficoFinanzas = null;
    let graficoHistorial = null;

    // Colores para los gráficos
    const colores = {
        ingresos: '#10b981',
        egresos: '#ef4444',
        categorias: [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444',
            '#10b981', '#84cc16', '#06b6d4', '#f97316', '#a855f7'
        ]
    };

    // Inicializar gráfico principal
    function inicializarGraficoFinanzas(ctx) {
        const datosIniciales = {
            labels: ['Ingresos', 'Egresos'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [colores.ingresos, colores.egresos],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        graficoFinanzas = new Chart(ctx, {
            type: 'doughnut',
            data: datosIniciales,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        return graficoFinanzas;
    }

    // Actualizar gráfico con datos reales
    function actualizarGraficoFinanzas(datos) {
        if (!graficoFinanzas) return;

        const { ingresos, egresos, datosCategorias } = datos;

        // Actualizar datos del gráfico
        graficoFinanzas.data.datasets[0].data = [ingresos, egresos];
        
        // Si hay datos de categorías, actualizar etiquetas
        if (datosCategorias && datosCategorias.length > 0) {
            graficoFinanzas.data.labels = datosCategorias.map(d => d.categoria);
            graficoFinanzas.data.datasets[0].data = datosCategorias.map(d => d.total);
            graficoFinanzas.data.datasets[0].backgroundColor = colores.categorias;
        }

        graficoFinanzas.update('active');
    }

    // Crear gráfico de historial
    function crearGraficoHistorial(ctx, datos) {
        if (graficoHistorial) {
            graficoHistorial.destroy();
        }

        graficoHistorial = new Chart(ctx, {
            type: 'line',
            data: {
                labels: datos.labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: datos.ingresos,
                        borderColor: colores.ingresos,
                        backgroundColor: `${colores.ingresos}20`,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Egresos',
                        data: datos.egresos,
                        borderColor: colores.egresos,
                        backgroundColor: `${colores.egresos}20`,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });

        return graficoHistorial;
    }

    // Generar datos para gráfico de categorías
    function generarDatosCategorias(transacciones) {
        const categoriasEgresos = DataManager.obtenerCategoriasPorTipo('egreso');
        const datosCategorias = categoriasEgresos.map(cat => {
            const total = transacciones
                .filter(t => t.tipo === 'egreso' && t.categoria === cat.nombre)
                .reduce((sum, t) => sum + t.monto, 0);
            return {
                categoria: cat.nombre,
                total: total,
                color: cat.color
            };
        }).filter(d => d.total > 0);

        return datosCategorias;
    }

    // Generar datos para gráfico de historial
    function generarDatosHistorial(transacciones, meses = 6) {
        const ahora = new Date();
        const labels = [];
        const datosIngresos = [];
        const datosEgresos = [];

        for (let i = meses - 1; i >= 0; i--) {
            const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
            const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
            labels.push(mes);

            const ingresos = transacciones
                .filter(t => t.tipo === 'ingreso' && 
                    new Date(t.fecha).getMonth() === fecha.getMonth() &&
                    new Date(t.fecha).getFullYear() === fecha.getFullYear())
                .reduce((sum, t) => sum + t.monto, 0);

            const egresos = transacciones
                .filter(t => t.tipo === 'egreso' && 
                    new Date(t.fecha).getMonth() === fecha.getMonth() &&
                    new Date(t.fecha).getFullYear() === fecha.getFullYear())
                .reduce((sum, t) => sum + t.monto, 0);

            datosIngresos.push(ingresos);
            datosEgresos.push(egresos);
        }

        return {
            labels,
            ingresos: datosIngresos,
            egresos: datosEgresos
        };
    }

    // Destruir gráficos
    function destruirGraficos() {
        if (graficoFinanzas) {
            graficoFinanzas.destroy();
            graficoFinanzas = null;
        }
        if (graficoHistorial) {
            graficoHistorial.destroy();
            graficoHistorial = null;
        }
    }

    return {
        inicializarGraficoFinanzas,
        actualizarGraficoFinanzas,
        crearGraficoHistorial,
        generarDatosCategorias,
        generarDatosHistorial,
        destruirGraficos
    };
})();