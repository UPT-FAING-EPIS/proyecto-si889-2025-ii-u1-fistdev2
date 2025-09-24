/**
 * Fixtures para pruebas de proyectos
 */

export const testProjects = {
  valid: {
    name: 'Proyecto de Prueba',
    description: 'Este es un proyecto creado para pruebas automatizadas',
    status: 'active'
  },
  update: {
    name: 'Proyecto Actualizado',
    description: 'Descripción actualizada para pruebas automatizadas',
    status: 'active'
  },
  invalid: {
    name: '',
    description: 'Proyecto sin nombre',
    status: 'active'
  }
};

export const testBoards = {
  valid: {
    name: 'Tablero de Prueba',
    description: 'Este es un tablero creado para pruebas automatizadas'
  },
  update: {
    name: 'Tablero Actualizado',
    description: 'Descripción actualizada para pruebas automatizadas'
  }
};

export const testColumns = [
  {
    name: 'Por hacer',
    order: 1
  },
  {
    name: 'En progreso',
    order: 2
  },
  {
    name: 'Completado',
    order: 3
  }
];

export const testTasks = {
  valid: {
    title: 'Tarea de prueba',
    description: 'Esta es una tarea creada para pruebas automatizadas',
    priority: 'medium'
  },
  update: {
    title: 'Tarea actualizada',
    description: 'Descripción actualizada para pruebas automatizadas',
    priority: 'high'
  }
};