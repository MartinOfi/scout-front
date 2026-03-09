/**
 * CampamentoCardComponent - Unit Tests
 * Dumb component - displays campamento card
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { CampamentoCardComponent } from './campamento-card.component';
import { Campamento } from '../../../../../../shared/models';
import { PersonaType, EstadoPersona } from '../../../../../../shared/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CampamentoCardComponent', () => {
  let component: CampamentoCardComponent;
  let fixture: ComponentFixture<CampamentoCardComponent>;

  const mockCampamento: Campamento = {
    id: 'camp-1',
    nombre: 'Campamento de Verano 2026',
    descripcion: 'Campamento anual en las sierras',
    fechaInicio: new Date('2026-01-15'),
    fechaFin: new Date('2026-01-20'),
    costoPorPersona: 5000,
    cuotasBase: 3,
    participantes: [
      {
        id: 'part-1',
        nombre: 'Juan',
        apellido: 'Pérez',
      dni: '12345678',
      fechaIngreso: new Date('2024-01-01'),
        tipo: PersonaType.PROTAGONISTA,
        estado: EstadoPersona.ACTIVO,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'part-2',
        nombre: 'María',
        apellido: 'López',
      dni: '12345678',
      fechaIngreso: new Date('2024-01-01'),
        tipo: PersonaType.PROTAGONISTA,
        estado: EstadoPersona.ACTIVO,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampamentoCardComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CampamentoCardComponent);
    component = fixture.componentInstance;
    component.campamento = mockCampamento;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Event Emitters', () => {
    it('should emit select event on card click', () => {
      vi.spyOn(component.select, 'emit');
      component.onSelect();
      expect(component.select.emit).toHaveBeenCalledWith('camp-1');
    });

    it('should emit edit event', () => {
      vi.spyOn(component.edit, 'emit');
      component.onEdit();
      expect(component.edit.emit).toHaveBeenCalledWith('camp-1');
    });

    it('should emit delete event', () => {
      vi.spyOn(component.delete, 'emit');
      component.onDelete();
      expect(component.delete.emit).toHaveBeenCalledWith('camp-1');
    });
  });

  describe('Template Rendering', () => {
    it('should display campamento nombre', () => {
      const title = fixture.debugElement.query(By.css('mat-card-title'));
      expect(title.nativeElement.textContent).toContain('Campamento de Verano 2026');
    });

    it('should display dates', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('15/01/2026');
      expect(content).toContain('20/01/2026');
    });

    it('should display costo por persona', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('5,000.00');
    });

    it('should display number of participantes', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('2');
    });

    it('should display descripcion when provided', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Campamento anual en las sierras');
    });
  });

  describe('Edge Cases', () => {
    it('should handle campamento with no participantes', () => {
      component.campamento = { ...mockCampamento, participantes: [] };
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('0');
    });

    it('should handle campamento with no descripcion', () => {
      component.campamento = { ...mockCampamento, descripcion: undefined };
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });
  });
});
