# 🧱 LSP Insight System

> **Sistema de Facilitación Inteligente para LEGO® Serious Play® con IA**

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-purple.svg)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-API-orange.svg)](https://ai.google.dev/)

## 🎯 **Descripción**

LSP Insight System es una aplicación web moderna que facilita sesiones de **LEGO® Serious Play®** utilizando inteligencia artificial. La aplicación guía a los usuarios a través de un proceso estructurado de 6 fases metodológicas, combinando construcción física con bricks y reflexión digital facilitada por IA.

## ✨ **Características Principales**

### 🤖 **IA Integrada**
- **Gemini 2.5 Flash** para facilitación inteligente
- **Análisis de imágenes** de modelos construidos
- **Procesamiento de lenguaje natural** en español
- **Respuestas contextualizadas** según la fase LSP

### 🧱 **Metodología LSP Completa**
- **6 Fases Estructuradas** de desarrollo
- **Seguimiento automático** del progreso
- **Protocolos personalizados** para cada sesión
- **Facilitación paso a paso** guiada por IA

### 🎨 **Interfaz Moderna**
- **Diseño responsive** con Tailwind CSS
- **Tema oscuro/claro** automático
- **Componentes interactivos** y animaciones
- **UX optimizada** para facilitadores y participantes

### 📱 **Funcionalidades Avanzadas**
- **Subida de imágenes** con preview
- **Reconocimiento de voz** (Speech-to-Text)
- **Síntesis de voz** (Text-to-Speech)
- **Marcado de insights** importantes
- **Galería de modelos** construidos
- **Copia de mensajes** y chat completo

## 🚀 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js 18+ 
- Cuenta de Google Cloud con acceso a Gemini API

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/4ailabs/LSP-system-V1-Gemini-.git
cd LSP-system-V1-Gemini-
```

### **2. Instalar Dependencias**
```bash
npm install --legacy-peer-deps
```

### **3. Configurar API Key**
```bash
# Crear archivo .env.local
echo "VITE_GEMINI_API_KEY=tu_api_key_aqui" > .env.local
```

### **4. Ejecutar la Aplicación**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔑 **Configuración de Gemini API**

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Crea una nueva API key
3. Agrega la key en tu archivo `.env.local`
4. Reinicia la aplicación

## 📚 **Uso de la Aplicación**

### **Iniciar una Sesión LSP**
1. **Escribe tu objetivo** en el chat
2. **Responde las preguntas** del facilitador IA
3. **Construye modelos** físicos con bricks
4. **Comparte fotos** de tus construcciones
5. **Reflexiona** sobre los insights emergentes

### **Navegación por Fases**
- **Fase 1**: Identificación y contextualización
- **Fase 2**: Desarrollo de protocolos
- **Fase 3**: Implementación LSP
- **Fase 4**: Descubrimiento de insights
- **Fase 5**: Desarrollo de estrategias
- **Fase 6**: Evaluación y análisis

### **Funcionalidades del Chat**
- **Marcar insights** con la estrella ⭐
- **Copiar mensajes** individuales
- **Escuchar respuestas** con síntesis de voz
- **Dictar mensajes** con reconocimiento de voz

## 🏗️ **Arquitectura Técnica**

### **Frontend**
- **React 19** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **Lucide React** para iconos

### **Backend & IA**
- **Google Gemini API** para facilitación
- **Procesamiento de imágenes** con base64
- **Streaming de respuestas** en tiempo real
- **Manejo de estado** optimizado

### **Características Técnicas**
- **Arquitectura de sesión única** simplificada
- **Manejo robusto de errores** con retry automático
- **Formateo inteligente** de mensajes
- **Persistencia local** de conversaciones

## 📁 **Estructura del Proyecto**

```
LSP-system-V1-Gemini-/
├── components/          # Componentes React
│   ├── ChatInput.tsx   # Entrada de chat con imagen/voz
│   ├── ChatWindow.tsx  # Ventana principal del chat
│   ├── Message.tsx     # Componente de mensaje individual
│   ├── Sidebar.tsx     # Barra lateral con navegación
│   └── icons.tsx       # Iconos de la aplicación
├── services/            # Servicios externos
│   └── geminiService.ts # Integración con Gemini API
├── hooks/               # Hooks personalizados
├── types.ts             # Definiciones de TypeScript
├── constants.ts         # Prompt del sistema y configuraciones
└── App.tsx             # Componente principal
```

## 🎨 **Personalización**

### **Modificar el Prompt del Sistema**
Edita `constants.ts` para personalizar:
- Instrucciones de facilitación
- Metodología LSP
- Comportamiento de la IA
- Análisis de imágenes

### **Estilos y Temas**
- Modifica `components/Message.tsx` para el formato de mensajes
- Ajusta `components/Sidebar.tsx` para la navegación
- Personaliza colores en `tailwind.config.js`

## 🚀 **Despliegue**

### **Build de Producción**
```bash
npm run build
```

### **Preview de Producción**
```bash
npm run preview
```

### **Despliegue en Vercel/Netlify**
1. Conecta tu repositorio GitHub
2. Configura las variables de entorno
3. Deploy automático en cada push

## 🤝 **Contribuciones**

Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 **Autor**

**Dr. Miguel Ojeda Rios**
- Desarrollador del sistema LSP Insight System
- Especialista en LEGO® Serious Play®
- Investigador en metodologías de facilitación

## 🙏 **Agradecimientos**

- **LEGO® Serious Play®** por la metodología
- **Google Gemini** por la API de IA
- **Comunidad React** por las herramientas
- **Contribuidores** del proyecto

## 📞 **Contacto**

- **GitHub**: [@4ailabs](https://github.com/4ailabs)
- **Proyecto**: [LSP Insight System](https://github.com/4ailabs/LSP-system-V1-Gemini-)

---

<div align="center">
  <strong>Construye, Reflexiona, Transforma</strong><br/>
  <em>Con LEGO® Serious Play® e Inteligencia Artificial</em>
</div>
