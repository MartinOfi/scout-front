/**
 * GastoEventoDialogComponent - Unit Tests
 */

import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { GastoEventoDialogComponent } from './gasto-evento-dialog.component';
import { GastoFormValue } from '../../../../campamentos/components/shared/gasto-campamento-form/gasto-campamento-form.component';
import { EstadoPago, PersonaType, EstadoPersona } from '../../../../../shared/enums';

const mockDialogData = {
  responsables: [
    {
      id: 'p1',
      nombre: 'Luis',
      apellido: 'Martínez',
      dni: '87654321',
      fechaIngreso: new Date(),
      tipo: PersonaType.EDUCADOR,
      estado: EstadoPersona.ACTIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

describe('GastoEventoDialogComponent', () => {
  let component: GastoEventoDialogComponent;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<GastoEventoDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [GastoEventoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(GastoEventoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFormSubmit', () => {
    it('should close dialog with mapped RegistrarGastoEventoDto (pagado)', () => {
      const formValue: GastoFormValue = {
        monto: 300,
        descripcion: 'Compra de materiales',
        responsableId: 'p1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO,
        fecha: '2026-04-08',
        personaAReembolsarId: undefined,
      };

      component.onFormSubmit(formValue);

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        dto: {
          monto: 300,
          descripcion: 'Compra de materiales',
          responsableId: 'p1',
          medioPago: 'efectivo',
          estadoPago: EstadoPago.PAGADO,
          personaAReembolsarId: undefined,
        },
      });
    });

    it('should include personaAReembolsarId when pendiente_reembolso', () => {
      const formValue: GastoFormValue = {
        monto: 150,
        descripcion: 'Combustible',
        responsableId: 'p1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PENDIENTE_REEMBOLSO,
        fecha: '2026-04-08',
        personaAReembolsarId: 'p1',
      };

      component.onFormSubmit(formValue);

      const closeArg = dialogRefSpy.close.calls.mostRecent().args[0];
      expect(closeArg?.dto?.personaAReembolsarId).toBe('p1');
      expect(closeArg?.dto?.estadoPago).toBe(EstadoPago.PENDIENTE_REEMBOLSO);
    });

    it('should NOT include fecha in the DTO', () => {
      const formValue: GastoFormValue = {
        monto: 200,
        descripcion: 'Gastos varios',
        responsableId: 'p1',
        medioPago: 'transferencia',
        estadoPago: EstadoPago.PAGADO,
        fecha: '2026-04-08',
      };

      component.onFormSubmit(formValue);

      const closeArg = dialogRefSpy.close.calls.mostRecent().args[0];
      expect(closeArg?.dto).not.toHaveProperty('fecha');
    });
  });

  describe('onCancel', () => {
    it('should close dialog without data', () => {
      component.onCancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(undefined);
    });
  });
});
