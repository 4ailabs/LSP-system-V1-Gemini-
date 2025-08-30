# 🚀 Configuración de LSP Insight System

## 📋 Prerrequisitos
- Node.js instalado en tu Mac
- Cuenta de Google Cloud con acceso a Gemini API

## 🔑 Configuración de la API Key

### 1. Obtener API Key de Gemini
1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Ve a "Get API key" en la esquina superior derecha
4. Crea una nueva API key o usa una existente
5. Copia la API key

### 2. Configurar la API Key en la aplicación
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza `your_gemini_api_key_here` con tu API key real:
   ```
   VITE_GEMINI_API_KEY=tu_api_key_aqui
   ```
3. Guarda el archivo

## 🏃‍♂️ Ejecutar la aplicación

### 1. Instalar dependencias
```bash
npm install --legacy-peer-deps
```

### 2. Iniciar en modo desarrollo
```bash
npm run dev
```

### 3. Abrir en el navegador
La aplicación se abrirá automáticamente en `http://localhost:5173`

## 🧪 Probar la funcionalidad

1. **Chat básico**: Escribe un mensaje y presiona Enter
2. **Subir imagen**: Usa el clip para adjuntar una imagen
3. **Voz**: Usa el micrófono para dictar mensajes
4. **Nueva sesión**: Crea una nueva sesión desde el sidebar

## 🐛 Solución de problemas

### Error: "VITE_GEMINI_API_KEY environment variable not set"
- Verifica que el archivo `.env.local` existe
- Asegúrate de que la variable esté correctamente nombrada
- Reinicia el servidor de desarrollo

### Error: "API key not valid"
- Verifica que tu API key sea correcta
- Asegúrate de que tengas acceso a Gemini API
- Verifica que tu cuenta de Google Cloud esté activa

### El chat no responde
- Revisa la consola del navegador (F12) para errores
- Verifica que la API key esté configurada
- Asegúrate de que tengas conexión a internet

## 📱 Funcionalidades disponibles

- ✅ Chat con IA usando Gemini
- ✅ Subida de imágenes
- ✅ Reconocimiento de voz
- ✅ Síntesis de voz
- ✅ Sistema de sesiones
- ✅ Seguimiento de fases LSP
- ✅ Marcado de insights
- ✅ Galería de modelos
- ✅ Tema oscuro/claro
- ✅ Responsive design

## 🔧 Comandos útiles

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```
