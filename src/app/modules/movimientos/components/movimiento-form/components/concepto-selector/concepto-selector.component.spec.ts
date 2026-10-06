import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConceptoSelectorComponent } from './concepto-selector.component';
import {
  CONCEPTO_MOVIMIENTO_LABELS,
  CONCEPTOS_MANUALES_POR_TIPO,
  ConceptoMovimiento,
  TipoMovimientoEnum,
} from '../../../../../../shared/enums';

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

  describe('conceptos ofrecidos según el tipo', () => {
    it('para INGRESO ofrece todos los conceptos de ingreso (no solo AJUSTE_INICIAL)', () => {
      fixture.componentRef.setInput('tipo', TipoMovimientoEnum.INGRESO);
      fixture.detectChanges();

      expect(component.conceptosFiltrados()).toEqual(
        CONCEPTOS_MANUALES_POR_TIPO[TipoMovimientoEnum.INGRESO],
      );
      expect(component.conceptosFiltrados()).toContain(ConceptoMovimiento.EVENTO_GRUPO_INGRESO);
      expect(component.conceptosFiltrados()).not.toContain(ConceptoMovimiento.GASTO_GENERAL);
    });

    it('para EGRESO ofrece todos los conceptos de egreso', () => {
      fixture.componentRef.setInput('tipo', TipoMovimientoEnum.EGRESO);
      fixture.detectChanges();

      expect(component.conceptosFiltrados()).toEqual(
        CONCEPTOS_MANUALES_POR_TIPO[TipoMovimientoEnum.EGRESO],
      );
      expect(component.conceptosFiltrados()).toContain(ConceptoMovimiento.GASTO_GENERAL);
      expect(component.conceptosFiltrados()).not.toContain(ConceptoMovimiento.EVENTO_GRUPO_INGRESO);
    });

    it('sin tipo seteado devuelve la unión de ingreso y egreso sin duplicados', () => {
      fixture.componentRef.setInput('tipo', null);
      fixture.detectChanges();

      const conceptos = component.conceptosFiltrados();

      expect(conceptos).toContain(ConceptoMovimiento.EVENTO_GRUPO_INGRESO);
      expect(conceptos).toContain(ConceptoMovimiento.GASTO_GENERAL);
      expect(conceptos.filter((c) => c === ConceptoMovimiento.AJUSTE_INICIAL).length).toBe(1);
    });

    it('renderiza una opción por concepto con su label', () => {
      fixture.componentRef.setInput('tipo', TipoMovimientoEnum.INGRESO);
      fixture.detectChanges();

      const options = (fixture.nativeElement as HTMLElement).querySelectorAll('option');
      const esperados: readonly ConceptoMovimiento[] =
        CONCEPTOS_MANUALES_POR_TIPO[TipoMovimientoEnum.INGRESO];

      expect(options.length).toBe(esperados.length + 1); // + placeholder
      expect(options[1].textContent?.trim()).toBe(CONCEPTO_MOVIMIENTO_LABELS[esperados[0]]);
    });
  });
});
