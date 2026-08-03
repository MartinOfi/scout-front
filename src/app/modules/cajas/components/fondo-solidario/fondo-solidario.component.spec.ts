/**
 * FondoSolidarioComponent Tests
 * TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FondoSolidarioComponent } from './fondo-solidario.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { createMockCajasStateService, MockCajasStateService } from '../../testing/cajas-test-utils';

describe('FondoSolidarioComponent', () => {
  let component: FondoSolidarioComponent;
  let fixture: ComponentFixture<FondoSolidarioComponent>;
  let mockStateService: MockCajasStateService;

  beforeEach(async () => {
    mockStateService = createMockCajasStateService();

    await TestBed.configureTestingModule({
      imports: [FondoSolidarioComponent],
      providers: [{ provide: CajasStateService, useValue: mockStateService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FondoSolidarioComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadConsolidado on ngOnInit', () => {
    component.ngOnInit();
    expect(mockStateService.loadConsolidado).toHaveBeenCalledTimes(1);
  });

  it('muestra el saldo disponible y el total bonificado', () => {
    mockStateService.saldoFondoSolidario.set(500000);
    mockStateService.bonificacionesOtorgadas.set(80000);
    mockStateService.cajaFondoSolidarioId.set('fondo-id');
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('500.000');
    expect(text).toContain('80.000');
  });

  it('muestra la acción de crear el fondo cuando todavía no existe', () => {
    mockStateService.cajaFondoSolidarioId.set(null);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Crear Fondo Solidario');
  });

  it('muestra la acción de transferir cuando el fondo ya existe', () => {
    mockStateService.cajaFondoSolidarioId.set('fondo-id');
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Transferir');
  });
});
