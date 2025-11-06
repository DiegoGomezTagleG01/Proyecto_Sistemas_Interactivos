**Rol del asistente:**
Actúa como un **desarrollador senior full-stack especializado en JavaScript, HTML y CSS**, con experiencia en **UX/UI y desarrollo educativo interactivo**.
Tu tarea es **diseñar y documentar un proyecto web completo** siguiendo las especificaciones que se describen a continuación.

---

### 🎯 **Objetivo general**

Desarrollar una **aplicación web interactiva** que ayude a los usuarios a **mejorar su ortografía y caligrafía**, utilizando **solo tecnologías web nativas (HTML, CSS y JavaScript)**.
El proyecto debe ser completamente funcional en el navegador, sin dependencias de Python ni frameworks de backend.

---

### ⚙️ **Requisitos funcionales**

1. **Módulos principales**

   * **Práctica de ortografía:** ejercicios interactivos (completar palabras, corregir errores o dictados virtuales).
   * **Módulo de caligrafía:** el usuario puede **trazar letras o palabras** mediante herramientas gráficas como `<canvas>` o SVG.
   * Todos los datos se guardan localmente (por ejemplo, usando `localStorage` o `IndexedDB`).

2. **Gestión de usuarios**

   * Registro e inicio de sesión básico (sin servidor, usando almacenamiento local).
   * Guardado del progreso (palabras corregidas, trazos, puntaje, nivel alcanzado).
   * Panel de usuario con estadísticas y niveles de dificultad.

3. **Retroalimentación interactiva**

   * Verificación automática de ortografía con sugerencias.
   * Indicadores visuales (verde = correcto, rojo = error, azul = continuar).
   * Animaciones ligeras y transiciones suaves.

---

### 🖌️ **Diseño e interfaz**

* Estilo **amigable, accesible y responsivo** (compatible con móviles, tablets y PC).
* **Paleta de colores suaves y contrastantes.**
* **Tipografía legible y moderna.**
* **Íconos, transiciones y animaciones suaves** para mejorar la experiencia del usuario.
* Basado en **principios de diseño UX centrado en el aprendizaje**.

---

### 🚀 **Compatibilidad y rendimiento**

* Totalmente funcional en navegadores modernos (Chrome, Firefox, Edge, Safari).
* Carga rápida y optimizada.
* Código modular y mantenible.
* Escalable para integrar más adelante un backend real (por ejemplo, con Firebase o Node.js).

---

### 📂 **Entrega esperada**

1. **Estructura de carpetas clara**, por ejemplo:

   ```
   /project-root
   ├── /src
   │   ├── /js
   │   ├── /css
   │   └── /html
   ├── /assets
   ├── /config
   │   └── setup.yml
   ├── /docs
   ├── index.html
   └── README.md
   ```

2. **Archivo de configuración `setup.yml`**, que contenga:

   * Configuración del entorno de desarrollo (por ejemplo: rutas, nombre del proyecto, versión, dependencias opcionales).
   * Scripts recomendados (inicialización, build, deploy local).
   * Parámetros básicos (colores base, idioma, modo oscuro, etc.).

   **Ejemplo:**

   ```yaml
   project:
     name: "Aprende-Ortografía-Caligrafía"
     version: "1.0.0"
     description: "Aplicación web interactiva para mejorar ortografía y caligrafía"

   environment:
     dev_server: "http://localhost:5500"
     build_tool: "vite"
     auto_reload: true

   settings:
     language: "es"
     theme: "light"
     primary_color: "#4B8FE2"
     secondary_color: "#F5F5F5"
     font_family: "Poppins, sans-serif"
   ```

3. **Código limpio, modular y comentado.**

4. **Archivo `README.md`** con:

   * Instrucciones claras para ejecutar el proyecto localmente (por ejemplo, con Live Server o Vite).
   * Descripción de los módulos y dependencias.
   * Guía de configuración usando `setup.yml`.

---

### 🧩 **Formato de respuesta esperado**

Organiza tu respuesta con esta estructura:

1. **Resumen general del sistema**
2. **Tecnologías y dependencias**
3. **Arquitectura del proyecto (mapa de carpetas)**
4. **Diseño del almacenamiento local (localStorage o IndexedDB)**
5. **Ejemplo de flujo de usuario (use case)**
6. **Código base de cada módulo principal (JS, HTML, CSS, canvas, etc.)**
7. **Archivo `setup.yml` simulado**
8. **Instrucciones de ejecución (`README.md` simulado)**
9. **Sugerencias de mejora o expansión futura**

---

### 💡 **Estilo de respuesta deseado**

* Claro, técnico y estructurado.
* Usa secciones, listas y comentarios en el código.
* Prioriza **claridad y funcionalidad** sobre teoría.
* Incluye ejemplos de código completos y funcionales.

---

### ✅ **Instrucción final**

Desarrolla **el proyecto completo**, paso a paso y con detalle, siguiendo los requisitos anteriores,
**usando solo HTML, CSS y JavaScript**, e incluyendo un archivo `setup.yml` para configuración rápida del entorno.