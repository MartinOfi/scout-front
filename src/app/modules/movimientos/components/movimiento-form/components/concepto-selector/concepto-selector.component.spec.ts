import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConceptoSelectorComponent } from './concepto-selector.component';
import { ConceptoMovimiento, TipoMovimientoEnum } from '../../../../../../shared/enums';

describe('ConceptoSelectorComponent', () => {
  let component: ConceptoSelectorComponent;
  let fixture: ComponentFixture<ConceptoSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptoSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptoSelectorComponent);
    component = fixture.componentInstance;
  });

  describe('whitelist de conceptos creables manualmente', () => {
    it('para EGRESO solo debe ofrecer GASTO_GENERAL y AJUSTE_INICIAL', () => {
      fixture.componentRef.setInput('tipo', TipoMovimientoEnum.EGRESO);
      fixture.detectChanges();

      const conceptos = component.conceptosFiltrados();

      expect(conceptos).toContain(ConceptoMovimiento.GASTO_GENERAL);
      expect(conceptos).toContain(ConceptoMovimiento.AJUSTE_INICIAL);
      expect(conceptos.length).toBe(2);
    });

    it('para INGRESO solo debe ofrecer AJUSTE_INICIAL', () => {
      fixture.componentRef.setInput('tipo', TipoMovimientoEnum.INGRESO);
      fixture.detectChanges();

      const conceptos = component.conceptosFiltrados();

      expect(conceptos).toContain(ConceptoMovimiento.AJUSTE_INICIAL);
      expect(conceptos).not.toContain(ConceptoMovimiento.GASTO_GENERAL);
      expect(conceptos.length).toBe(1);
    });

    it('no debe ofrecer conceptos de sistema (cuota, inscripcion, campamento, evento, reembolso)', () => {
      fixture.componentRef.setInput('tipo', TipoMovimientoEnum.INGRESO);
      fixture.detectChanges();

      const conceptos = component.conceptosFiltrados();

      const conceptosSistema = [
        ConceptoMovimiento.INSCRIPCION_GRUPO,
        ConceptoMovimiento.INSCRIPCION_SCOUT_ARGENTINA,
        ConceptoMovimiento.INSCRIPCION_PAGO_SCOUT_ARGENTINA,
        ConceptoMovimiento.CUOTA_GRUPO,
        ConceptoMovimiento.CAMPAMENTO_PAGO,
        ConceptoMovimiento.CAMPAMENTO_GASTO,
        ConceptoMovimiento.EVENTO_VENTA_INGRESO,
        ConceptoMovimiento.EVENTO_VENTA_GASTO,
        ConceptoMovimiento.EVENTO_GRUPO_INGRESO,
        ConceptoMovimiento.EVENTO_GRUPO_GASTO,
        ConceptoMovimiento.REEMBOLSO,
        ConceptoMovimiento.ASIGNACION_FONDO_RAMA,
        ConceptoMovimiento.TRANSFERENCIA_SALDO_PERSONAL,
        ConceptoMovimiento.USO_SALDO_PERSONAL,
      ];

      for (const conceptoSistema of conceptosSistema) {
        expect(conceptos).not.toContain(conceptoSistema);
      }
    });

    it('sin tipo seteado debe retornar solo conceptos manuales (union sin duplicados)', () => {
      fixture.componentRef.setInput('tipo', null);
      fixture.detectChanges();

      const conceptos = component.conceptosFiltrados();

      expect(conceptos).toContain(ConceptoMovimiento.GASTO_GENERAL);
      expect(conceptos).toContain(ConceptoMovimiento.AJUSTE_INICIAL);
      expect(conceptos.length).toBe(2);
    });
  });
});
