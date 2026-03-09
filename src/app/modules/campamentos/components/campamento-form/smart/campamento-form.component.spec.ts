import { vi } from 'vitest';
/**
 * CampamentoFormComponent - Unit Tests (Basic)
 * Smart component - form management
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampamentoFormComponent } from './campamento-form.component';
import { CampamentosStateService } from '../../../services/campamentos-state.service';
import { CampamentosFormBuilder } from '../../../services/campamentos-form.builder';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('CampamentoFormComponent', () => {
  let component: CampamentoFormComponent;
  let fixture: ComponentFixture<CampamentoFormComponent>;
  let mockStateService: any;
  let mockFormBuilder: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const fb = new FormBuilder();
    
    mockStateService = {
      campamentos: signal([]),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({}))
    };

    mockFormBuilder = {
      buildCreateForm: vi.fn().mockReturnValue(
        fb.group({ nombre: [''], descripcion: [''], fechaInicio: [''], fechaFin: [''], costoPorPersona: [''] })
      ),
      extractCreateDto: vi.fn().mockReturnValue({})
    };

    mockRouter = { navigate: vi.fn() };
    mockActivatedRoute = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } }
    };

    await TestBed.configureTestingModule({
      imports: [CampamentoFormComponent, NoopAnimationsModule],
      providers: [
        { provide: CampamentosStateService, useValue: mockStateService },
        { provide: CampamentosFormBuilder, useValue: mockFormBuilder },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CampamentoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form', () => {
    expect(component.form).toBeDefined();
  });

  it('should initialize form on create mode', () => {
    expect(mockFormBuilder.buildCreateForm).toHaveBeenCalled();
  });

  it('should call create when submitting in create mode', () => {
    component.onSubmit();
    expect(mockFormBuilder.extractCreateDto).toHaveBeenCalled();
  });
});
