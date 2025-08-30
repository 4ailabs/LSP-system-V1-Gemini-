import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

// Tabla de sesiones LSP
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  currentPhase: integer('current_phase').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  userId: text('user_id'), // Para futuras implementaciones multi-usuario
});

// Tabla de mensajes del chat
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'model'] }).notNull(),
  content: text('content').notNull(),
  isInsight: integer('is_insight', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  orderIndex: integer('order_index').notNull(), // Para mantener el orden de los mensajes
});

// Tabla de imágenes/modelos construidos
export const images = sqliteTable('images', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  messageId: text('message_id').references(() => messages.id, { onDelete: 'cascade' }),
  title: text('title'),
  description: text('description'),
  imageData: blob('image_data').notNull(), // Base64 de la imagen
  mimeType: text('mime_type').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
});

// Tabla de insights marcados
export const insights = sqliteTable('insights', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  category: text('category'), // Ej: 'breakthrough', 'reflection', 'action'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
});

// Tabla de fases LSP
export const phases = sqliteTable('phases', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  order: integer('order').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
});

// Tipos TypeScript derivados del esquema
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;
export type Phase = typeof phases.$inferSelect;
export type NewPhase = typeof phases.$inferInsert;
