/**
 * Pruebas unitarias para el componente selector de hora
 *
 * Basado en las especificaciones del todo.md líneas 67, 90
 * Pruebas unitarias
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimePickerComponent } from './time-picker.component';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePickerComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label when provided', async () => {
    component.label = 'Hora de inicio';
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const labelElement =
      fixture.nativeElement.querySelector('.time-picker-label');
    expect(labelElement.textContent).toContain('Hora de inicio');
  });

  it('should show required indicator when required is true', async () => {
    component.label = 'Hora de inicio';
    component.required = true;
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const requiredIndicator = fixture.nativeElement.querySelector(
      '.required-indicator'
    );
    expect(requiredIndicator).toBeTruthy();
  });

  it('should emit timeChange when time is selected', () => {
    spyOn(component.timeChange, 'emit');

    const input = fixture.nativeElement.querySelector('.time-picker-input');
    input.value = '10:30';
    input.dispatchEvent(new Event('change'));

    expect(component.timeChange.emit).toHaveBeenCalledWith('10:30');
  });

  it('should be disabled when disabled is true', async () => {
    component.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const input = fixture.nativeElement.querySelector('.time-picker-input');
    expect(input.disabled).toBeTruthy();
  });

  it('should display error message when provided', async () => {
    component.errorMessage = 'Hora inválida';
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement.textContent).toContain('Hora inválida');
  });
});

