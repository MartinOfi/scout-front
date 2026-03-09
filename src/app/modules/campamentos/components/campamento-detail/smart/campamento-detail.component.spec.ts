import { vi } from 'vitest';
/**
 * CampamentoDetailComponent - Unit Tests (Basic)
 * Smart component - state management and tabs
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampamentoDetailComponent } from './campamento-detail.component';
import { CampamentosStateService } from '../../../services/campamentos-state.service';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CampamentoDetailComponent', () => {
  let component: CampamentoDetailComponent;
  let fixture: ComponentFixture<CampamentoDetailComponent>;
  let mockStateService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockStateService = {
      campamentos: signal([]),
      loading: signal(false),
      error: signal(null),
      loadPagosPorParticipante: vi.fn()
    };

    mockRouter = { navigate: vi.fn() };
    mockActivatedRoute = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('camp-1') } }
    };

    await TestBed.configureTestingModule({
      imports: [CampamentoDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: CampamentosStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CampamentoDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load campamento on init', () => {
    fixture.detectChanges();
    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
  });

  it('should have campamento signal', () => {
    expect(component.campamento).toBeDefined();
  });

  it('should expose loading and error signals', () => {
    expect(component.loading).toBe(mockStateService.loading);
    expect(component.error).toBe(mockStateService.error);
  });
});
