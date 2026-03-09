/**
 * Pruebas unitarias para el componente selector múltiple de días
 *
 * Basado en las especificaciones del todo.md líneas 68, 91
 * Pruebas unitarias
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DaysSelectorComponent } from './days-selector.component';
import { DayOfWeek } from '../../../../models/core/day-of-week.enum';

describe('DaysSelectorComponent', () => {
  let component: DaysSelectorComponent;
  let fixture: ComponentFixture<DaysSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FormsModule, ReactiveFormsModule, DaysSelectorComponent],
}).compileComponents();

    fixture = TestBed.createComponent(DaysSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label when provided', async () => {
    component.label = 'Días disponibles';
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const labelElement = fixture.nativeElement.querySelector(
      '.days-selector-label'
    );
    expect(labelElement.textContent).toContain('Días disponibles');
  });

  it('should show required indicator when required is true', async () => {
    component.label = 'Días disponibles';
    component.required = true;
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const requiredIndicator = fixture.nativeElement.querySelector(
      '.required-indicator'
    );
    expect(requiredIndicator).toBeTruthy();
  });

  it('should toggle day selection when day is clicked', () => {
    spyOn(component, 'toggleDay');

    const dayItem = fixture.nativeElement.querySelector('.day-item');
    dayItem.click();

    expect(component.toggleDay).toHaveBeenCalled();
  });

  it('should emit daysChange when day is toggled', () => {
    spyOn(component.daysChange, 'emit');

    component.toggleDay(DayOfWeek.MONDAY);

    expect(component.daysChange.emit).toHaveBeenCalled();
  });

  it('should select all days when selectAllDays is called', () => {
    spyOn(component.daysChange, 'emit');

    component.selectAllDays();

    expect(component.value.length).toBe(7);
    expect(component.daysChange.emit).toHaveBeenCalled();
  });

  it('should clear all days when clearAllDays is called', () => {
    component.value = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY];
    spyOn(component.daysChange, 'emit');

    component.clearAllDays();

    expect(component.value.length).toBe(0);
    expect(component.daysChange.emit).toHaveBeenCalled();
  });

  it('should be disabled when disabled is true', async () => {
    component.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const dayItems = fixture.nativeElement.querySelectorAll('.day-item');
    expect(dayItems[0].classList.contains('disabled')).toBeTruthy();
  });

  it('should display error message when provided', async () => {
    component.errorMessage = 'Debe seleccionar al menos un día';
    fixture.detectChanges();
    await fixture.whenStable(); // Esperar a que el hybrid scheduler complete el cambio detection

    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement.textContent).toContain(
      'Debe seleccionar al menos un día'
    );
  });
});

