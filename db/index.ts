import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

// Crear conexión a la base de datos
const sqlite = new Database('lsp-insight-system.db');
export const db = drizzle(sqlite, { schema });

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    // Crear las tablas si no existen
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        current_phase INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        user_id TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'model')),
        content TEXT NOT NULL,
        is_insight INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        order_index INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        message_id TEXT,
        title TEXT,
        description TEXT,
        image_data BLOB NOT NULL,
        mime_type TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS phases (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        is_active INTEGER DEFAULT 0
      );

      -- Crear índices para mejor rendimiento
      CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages (session_id);
      CREATE INDEX IF NOT EXISTS idx_messages_order_index ON messages (order_index);
      CREATE INDEX IF NOT EXISTS idx_images_session_id ON images (session_id);
      CREATE INDEX IF NOT EXISTS idx_insights_session_id ON insights (session_id);
    `);

    // Insertar fases LSP por defecto si no existen
    const phasesExist = sqlite.prepare('SELECT COUNT(*) as count FROM phases').get() as { count: number };
    
    if (phasesExist.count === 0) {
      const insertPhase = sqlite.prepare(`
        INSERT INTO phases (id, name, description, "order", is_active) 
        VALUES (?, ?, ?, ?, ?)
      `);

      const defaultPhases = [
        [1, 'Identificación', 'Definimos el desafío', 1, 1],
        [2, 'Protocolo', 'Diseñamos la construcción', 2, 0],
        [3, 'Implementación', 'Construimos y compartimos', 3, 0],
        [4, 'Insights', 'Descubrimos significados', 4, 0],
        [5, 'Estrategia', 'Convertimos insights en acción', 5, 0],
        [6, 'Evaluación', 'Reflexionamos y consolidamos', 6, 0]
      ];

      defaultPhases.forEach(phase => insertPhase.run(phase));
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Función para cerrar la conexión
export function closeDatabase() {
  sqlite.close();
}
