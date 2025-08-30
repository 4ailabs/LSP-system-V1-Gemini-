import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from './index';
import { sessions, messages, images, insights, phases } from './schema';
import type { NewSession, NewMessage, NewImage, NewInsight } from './schema';

// Servicios para Sesiones
export const sessionService = {
  // Crear nueva sesión
  async create(session: NewSession) {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  },

  // Obtener sesión por ID
  async getById(id: string) {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  },

  // Obtener todas las sesiones
  async getAll() {
    return await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  },

  // Actualizar sesión
  async update(id: string, updates: Partial<NewSession>) {
    const result = await db
      .update(sessions)
      .set({ ...updates, updatedAt: Date.now() })
      .where(eq(sessions.id, id))
      .returning();
    return result[0];
  },

  // Eliminar sesión
  async delete(id: string) {
    await db.delete(sessions).where(eq(sessions.id, id));
  },

  // Cambiar fase de la sesión
  async updatePhase(id: string, phase: number) {
    return await this.update(id, { currentPhase: phase });
  }
};

// Servicios para Mensajes
export const messageService = {
  // Crear nuevo mensaje
  async create(message: NewMessage) {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  },

  // Obtener mensajes de una sesión
  async getBySessionId(sessionId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.orderIndex));
  },

  // Marcar mensaje como insight
  async toggleInsight(id: string) {
    const message = await db.select().from(messages).where(eq(messages.id, id));
    if (message[0]) {
      const newValue = !message[0].isInsight;
      const result = await db
        .update(messages)
        .set({ isInsight: newValue })
        .where(eq(messages.id, id))
        .returning();
      return result[0];
    }
    return null;
  },

  // Eliminar mensaje
  async delete(id: string) {
    await db.delete(messages).where(eq(messages.id, id));
  }
};

// Servicios para Imágenes
export const imageService = {
  // Crear nueva imagen
  async create(image: NewImage) {
    const result = await db.insert(images).values(image).returning();
    return result[0];
  },

  // Obtener imágenes de una sesión
  async getBySessionId(sessionId: string) {
    return await db
      .select()
      .from(images)
      .where(eq(images.sessionId, sessionId))
      .orderBy(desc(images.createdAt));
  },

  // Obtener imagen por ID
  async getById(id: string) {
    const result = await db.select().from(images).where(eq(images.id, id));
    return result[0];
  },

  // Eliminar imagen
  async delete(id: string) {
    await db.delete(images).where(eq(images.id, id));
  }
};

// Servicios para Insights
export const insightService = {
  // Crear nuevo insight
  async create(insight: NewInsight) {
    const result = await db.insert(insights).values(insight).returning();
    return result[0];
  },

  // Obtener insights de una sesión
  async getBySessionId(sessionId: string) {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.sessionId, sessionId))
      .orderBy(desc(insights.createdAt));
  },

  // Eliminar insight
  async delete(id: string) {
    await db.delete(insights).where(eq(insights.id, id));
  }
};

// Servicios para Fases
export const phaseService = {
  // Obtener todas las fases
  async getAll() {
    return await db.select().from(phases).orderBy(asc(phases.order));
  },

  // Obtener fase activa
  async getActive() {
    const result = await db.select().from(phases).where(eq(phases.isActive, true));
    return result[0];
  },

  // Cambiar fase activa
  async setActive(phaseId: number) {
    // Desactivar todas las fases
    await db.update(phases).set({ isActive: false });
    // Activar la fase especificada
    const result = await db
      .update(phases)
      .set({ isActive: true })
      .where(eq(phases.id, phaseId))
      .returning();
    return result[0];
  }
};
