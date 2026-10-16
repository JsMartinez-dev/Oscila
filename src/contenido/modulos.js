// Módulos de la plataforma. estado: 'activo' | 'revision' (oculto en modo feria) | 'pronto' (deshabilitado).

export const MODULOS = [
  {
    id: 'electricidad',
    nombre: 'Electricidad y Magnetismo',
    estado: 'activo',
    ruta: 'inicio',
    descripcion: 'Potencial, capacitancia, circuitos y leyes de Kirchhoff, con un montaje virtual que resuelve cada circuito paso a paso.',
  },
  {
    id: 'calor-ondas',
    nombre: 'Calor y Ondas',
    estado: 'revision',
    ruta: 'co-inicio',
    descripcion: 'Oscilaciones y ondas mecánicas: marco conceptual, aplicaciones, laboratorio de simulaciones, ejercicios y test. Módulo original del equipo de Calor y Ondas, en revisión.',
  },
  {
    id: 'mecanica',
    nombre: 'Mecánica',
    estado: 'pronto',
    ruta: null,
    descripcion: 'Módulo en preparación.',
  },
];

export const ETIQUETA_ESTADO = { revision: 'En revisión', pronto: 'Próximamente' };

/** Módulos visibles: en modo feria se ocultan los que están en revisión. */
export const modulosVisibles = (feria) => MODULOS.filter((m) => !(feria && m.estado === 'revision'));
