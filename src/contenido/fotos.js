// Ejemplos guardados para el modo sin internet: la foto (o una imagen de reemplazo) y el reconocimiento ya hecho.
// Para usar fotos reales: guarda la foto como public/ejemplos_foto/ej11.jpg (… ej15.jpg). Si haces el
// reconocimiento en línea de esa foto, descarga su JSON y reemplaza src/contenido/fotos/ejXX.json.

import ej11 from './fotos/ej11.json';
import ej12 from './fotos/ej12.json';
import ej13 from './fotos/ej13.json';
import ej14 from './fotos/ej14.json';
import ej15 from './fotos/ej15.json';
import { DOC_EJ11, DOC_EJ12, DOC_EJ13, DOC_EJ14, DOC_EJ15 } from '../circuitos/ejemplos.js';

export const FOTOS_GUARDADAS = [
  { id: 'ej11', titulo: 'Ejercicio 11', foto: 'ejemplos_foto/ej11.jpg', reconocimiento: ej11, referencia: DOC_EJ11 },
  { id: 'ej12', titulo: 'Ejercicio 12', foto: 'ejemplos_foto/ej12.jpg', reconocimiento: ej12, referencia: DOC_EJ12 },
  { id: 'ej13', titulo: 'Ejercicio 13', foto: 'ejemplos_foto/ej13.jpg', reconocimiento: ej13, referencia: DOC_EJ13 },
  { id: 'ej14', titulo: 'Ejercicio 14', foto: 'ejemplos_foto/ej14.jpg', reconocimiento: ej14, referencia: DOC_EJ14 },
  { id: 'ej15', titulo: 'Ejercicio 15', foto: 'ejemplos_foto/ej15.jpg', reconocimiento: ej15, referencia: DOC_EJ15 },
];
