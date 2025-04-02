# 🌐 RowRoad - Tu Red Social Moderna

Bienvenido a **RowRoad**, una plataforma social diseñada para conectar a personas de manera fácil y rápida. Con una interfaz intuitiva y moderna, RowRoad te permite compartir publicaciones, interactuar con otros usuarios y descubrir contenido relevante.

## 🚀 Características Principales

✅ **Interfaz rápida y responsiva** gracias a **React + Vite + Tailwind CSS**.  
✅ **Autenticación segura** para proteger los datos de los usuarios.  
✅ **Bottombar optimizado** para una mejor experiencia en dispositivos móviles.  
✅ **Publicaciones personalizables** con imágenes, texto y reacciones.  
✅ **Sistema de navegación eficiente** con una estructura clara y amigable.

## 📋 Requisitos

Para ejecutar **RowRoad**, necesitas:
- **Node.js 20.14.0** o superior.
- **Docker** (opcional, para facilitar la ejecución en distintos entornos).
- Un navegador moderno como **Chrome** o **Firefox**.

## 🛠 Instalación y Ejecución

1️⃣ Clona este repositorio:
   ```sh
   git clone https://github.com/PanConPoio/RowRoad.git
   ```
2️⃣ Accede al directorio del proyecto:
   ```sh
   cd rowroad
   ```
3️⃣ Instala las dependencias:
   ```sh
   npm install
   ```
4️⃣ Inicia el servidor en desarrollo:
   ```sh
   npm run dev
   ```
   Luego, accede a **http://localhost:5173/** para ver la aplicación en acción.

## 🐳 Ejecución con Docker (Opcional)

Si deseas ejecutar el proyecto con Docker:
```sh
# Construir la imagen
docker build -t rowroad-app .

# Ejecutar el contenedor
docker run -p 5173:5173 rowroad-app
```

## 📂 Estructura del Proyecto

📌 `src/` → Contiene los componentes principales de la aplicación.  
📌 `public/` → Archivos estáticos como imágenes y el `index.html`.  
📌 `package.json` → Configuración de dependencias y scripts.  
📌 `Dockerfile` → Configuración para contenedores Docker.

## 🎯 Roadmap y Mejoras Futuras

🚀 **Optimización de rendimiento** para mejorar la carga y navegación.  
💬 **Mensajería en tiempo real** para mejorar la comunicación entre usuarios.  
📱 **Modo oscuro** para una mejor experiencia visual.  
🛡 **Mayor seguridad en la autenticación** y protección de datos.

## 💡 ¿Cómo Contribuir?

🙌 ¡Tu ayuda es bienvenida! Para contribuir:
1. Haz un **fork** del repositorio.
2. Crea una nueva rama para tus cambios.
3. Envía un **pull request** con tu propuesta.

## 📜 Licencia

📝 Este proyecto está bajo la licencia **MIT**, lo que significa que puedes usarlo y modificarlo libremente. Para más detalles, revisa el archivo `LICENSE`.

---

¡Esperamos que disfrutes RowRoad! Si tienes preguntas o sugerencias, no dudes en compartirlas. 🚀

