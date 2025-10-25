/* data.js
   Manejo de datos: LocalStorage, transacciones y categorías.
   Comentarios en español.
*/

const STORAGE_KEY = 'simFin_v1';

// Estructura guardada en localStorage:
// {
//   categorias: [ {id, emoji, nombre, tipo} ],
//   transacciones: [ {id, tipo, monto, categoriaId, nota, fecha, createdAt} ],
//   settings: {theme, accentColor, sounds, goalAmount, thresholds}
// }

const DataStore = (function(){
  // Cargar datos iniciales desde localStorage o crear estructura por defecto
  function cargar(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){
      const inicial = {
        categorias: null, // se cargará desde JSON por defecto si null
        transacciones: [],
        settings: {
          theme: 'auto',
          accentColor: '#3b82f6',
          sounds: true,
          goalAmount: 1000,
          thresholds: {safe: 1000, warn: 0} // simple ejemplo
        },
        achievements: []
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inicial));
      return inicial;
    }
    try{
      return JSON.parse(raw);
    }catch(e){
      console.error("Error parseando localStorage, se restaurará estado inicial.", e);
      localStorage.removeItem(STORAGE_KEY);
      return cargar();
    }
  }

  function guardar(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Inicializa categorías si no existen (carga categories.json)
  async function initCategorias(state){
    if(state.categorias && state.categorias.length) return state;
    try{
      // Se intenta cargar el JSON local con fetch
      const resp = await fetch('data/categories.json');
      const json = await resp.json();
      state.categorias = json;
      guardar(state);
      return state;
    }catch(e){
      console.warn("No se pudo cargar categories.json, usando categorías por defecto embebidas.");
      state.categorias = [
        {"id":"sueldo","emoji":"💰","nombre":"Sueldo","tipo":"ingreso"},
        {"id":"comida","emoji":"🍕","nombre":"Comida","tipo":"egreso"}
      ];
      guardar(state);
      return state;
    }
  }

  // API pública
  return {
    cargar,
    guardar,
    initCategorias,
    agregarTransaccion(state, trans){
      trans.id = 't_' + Date.now();
      trans.createdAt = new Date().toISOString();
      state.transacciones.push(trans);
      guardar(state);
      return state;
    },
    eliminarTransaccion(state, id){
      state.transacciones = state.transacciones.filter(t => t.id !== id);
      guardar(state);
      return state;
    },
    editarTransaccion(state, id, cambios){
      state.transacciones = state.transacciones.map(t => t.id === id ? {...t, ...cambios} : t);
      guardar(state);
      return state;
    },
    agregarCategoria(state, cat){
      // id único simple
      cat.id = cat.nombre.toLowerCase().replace(/\s+/g,'_') + '_' + Date.now();
      state.categorias.push(cat);
      guardar(state);
      return state;
    },
    eliminarCategoria(state, id){
      state.categorias = state.categorias.filter(c => c.id !== id);
      // opcional: reasignar transacciones a 'otros' (no implementado)
      guardar(state);
      return state;
    }
  }
})();
