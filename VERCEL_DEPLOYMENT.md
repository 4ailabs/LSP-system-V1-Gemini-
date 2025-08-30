# 🚀 Despliegue en Vercel con SQLite + Drizzle

## 📋 **Prerrequisitos**

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Google Cloud](https://cloud.google.com) con Gemini API
- [Git](https://git-scm.com) instalado
- [Node.js](https://nodejs.org) 18+ instalado

## 🔧 **Configuración Local**

### **1. Instalar Dependencias**
```bash
npm install --legacy-peer-deps
```

### **2. Configurar Base de Datos**
```bash
# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Opcional: Abrir Drizzle Studio
npm run db:studio
```

### **3. Configurar Variables de Entorno**
```bash
# Crear archivo .env.local
echo "VITE_GEMINI_API_KEY=tu_api_key_aqui" > .env.local
```

## 🌐 **Despliegue en Vercel**

### **1. Conectar Repositorio**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Selecciona el repositorio `LSP-system-V1-Gemini-`

### **2. Configurar Variables de Entorno**
En la configuración del proyecto en Vercel:

```bash
# Variables de Entorno
VITE_GEMINI_API_KEY=tu_api_key_real_de_gemini
```

### **3. Configuración del Proyecto**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

### **4. Desplegar**
1. Haz clic en "Deploy"
2. Espera a que se complete el build
3. Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

## 🗄️ **Base de Datos SQLite en Vercel**

### **⚠️ Limitaciones Importantes**
- **SQLite en Vercel** es **solo para desarrollo**
- **No persiste** entre deployments
- **Cada deployment** crea una nueva base de datos

### **🔄 Soluciones para Producción**

#### **Opción 1: Turso (Recomendado)**
```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Crear base de datos
turso db create lsp-insight-system

# Obtener token
turso db tokens create lsp-insight-system

# Configurar en Vercel
TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu_token_aqui
```

#### **Opción 2: PlanetScale (MySQL)**
```bash
# Instalar PlanetScale CLI
npm install -g pscale

# Crear base de datos
pscale database create lsp-insight-system

# Obtener conexión
pscale connect lsp-insight-system
```

#### **Opción 3: Supabase (PostgreSQL)**
```bash
# Crear proyecto en Supabase
# Obtener URL y API key
# Configurar en Vercel
SUPABASE_URL=tu_url
SUPABASE_ANON_KEY=tu_key
```

## 🔄 **Migración de Base de Datos**

### **Para Turso (SQLite)**
```typescript
// db/index.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

### **Para PlanetScale (MySQL)**
```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import * as schema from './schema';

const connection = connect({
  host: process.env.DATABASE_HOST!,
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
});

export const db = drizzle(connection, { schema });
```

## 🧪 **Testing del Despliegue**

### **1. Verificar Funcionalidades**
- ✅ Chat con Gemini funciona
- ✅ Subida de imágenes funciona
- ✅ Base de datos persiste datos
- ✅ Insights se guardan correctamente

### **2. Monitoreo**
- **Vercel Analytics** para métricas
- **Logs** en Vercel Dashboard
- **Performance** con Core Web Vitals

## 🚨 **Solución de Problemas Comunes**

### **Error: "Module not found"**
```bash
# Verificar que todas las dependencias estén en package.json
npm install --legacy-peer-deps
```

### **Error: "Database connection failed"**
- Verificar variables de entorno
- Verificar permisos de base de datos
- Verificar configuración de red

### **Error: "Build failed"**
- Verificar logs de build en Vercel
- Verificar compatibilidad de Node.js
- Verificar scripts en package.json

## 📚 **Recursos Adicionales**

- [Vercel Documentation](https://vercel.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Turso Documentation](https://docs.tur.so/)
- [PlanetScale Documentation](https://planetscale.com/docs)

## 🎯 **Próximos Pasos**

1. **Desplegar en Vercel** con SQLite local
2. **Migrar a Turso** para persistencia real
3. **Configurar CI/CD** con GitHub Actions
4. **Agregar monitoreo** y analytics
5. **Implementar backup** automático de base de datos

---

**¡Tu aplicación LSP Insight System estará funcionando perfectamente en Vercel con una base de datos robusta!** 🎉
