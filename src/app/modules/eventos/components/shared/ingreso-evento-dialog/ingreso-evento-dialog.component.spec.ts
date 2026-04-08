/**
 * IngresoEventoDialogComponent - Unit Tests
 */

import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { IngresoEventoDialogComponent } from './ingreso-evento-dialog.component';
import { IngresoFormValue } from '../../../../../shared/components/ingreso-form/ingreso-form.component';
import { PersonaType, EstadoPersona } from '../../../../../shared/enums';

const mockDialogData = {
  responsables: [
    {
      id: 'p1',
      nombre: 'Ana',
      apellido: 'García',
      dni: '12345678',
      fechaIngreso: new Date(),
      tipo: PersonaType.EDUCADOR,
      estado: EstadoPersona.ACTIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

describe('IngresoEventoDialogComponent', () => {
  let component: IngresoEventoDialogComponent;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<IngresoEventoDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [IngresoEventoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(IngresoEventoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFormSubmit', () => {
    it('should close dialog with mapped RegistrarIngresoEventoDto', () => {
      const formValue: IngresoFormValue = {
        monto: 500,
        descripcion: 'Venta de rifas',
        responsableId: 'p1',
        medioPago: 'efectivo',
      };

      component.onFormSubmit(formValue);

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        dto: {
          monto: 500,
          descripcion: 'Venta de rifas',
          responsableId: 'p1',
          medioPago: 'efectivo',
        },
      });
    });
  });

  describe('onCancel', () => {
    it('should close dialog without data', () => {
      component.onCancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(undefined);
    });
  });
});
