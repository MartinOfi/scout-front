import { EstadoPersona } from '../enums';
import { esPersonaDeshabilitada, soloHabilitadas } from './persona-estado.util';

describe('persona-estado.util', () => {
  const activa = { id: 'a', estado: EstadoPersona.ACTIVO };
  const deshabilitada = { id: 'd', estado: EstadoPersona.INACTIVO };
  const sinEstado: { id: string; estado?: EstadoPersona } = { id: 's' };

  it('esPersonaDeshabilitada: solo el estado inactivo cuenta como deshabilitado', () => {
    expect(esPersonaDeshabilitada(activa)).toBe(false);
    expect(esPersonaDeshabilitada(deshabilitada)).toBe(true);
    expect(esPersonaDeshabilitada(sinEstado)).toBe(false);
  });

  it('soloHabilitadas: descarta a los deshabilitados sin mutar la lista original', () => {
    const personas = [activa, deshabilitada, sinEstado];

    expect(soloHabilitadas(personas)).toEqual([activa, sinEstado]);
    expect(personas).toHaveLength(3);
  });
});
