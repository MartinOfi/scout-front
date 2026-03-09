import { vi } from 'vitest';
/**
 * CampamentosListComponent - Unit Tests (Basic)
 * Smart component - list management
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampamentosListComponent } from './campamentos-list.component';
import { CampamentosStateService } from '../../../services/campamentos-state.service';
import { ConfirmDialogService } from '../../../../../shared/services';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('CampamentosListComponent', () => {
  let component: CampamentosListComponent;
  let fixture: ComponentFixture<CampamentosListComponent>;
  let mockStateService: any;
  let mockRouter: any;
  let mockConfirmDialog: any;

  beforeEach(async () => {
    mockStateService = {
      campamentos: signal([]),
      loading: signal(false),
      error: signal(null),
      load: vi.fn(),
      delete: vi.fn().mockReturnValue(of(undefined))
    };

    mockRouter = { navigate: vi.fn() };
    mockConfirmDialog = {
      confirmDelete: vi.fn().mockReturnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [CampamentosListComponent, NoopAnimationsModule],
      providers: [
        { provide: CampamentosStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CampamentosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load campamentos on init', () => {
    expect(mockStateService.load).toHaveBeenCalled();
  });

  it('should expose campamentos signal', () => {
    expect(component.campamentos).toBe(mockStateService.campamentos);
  });

  it('should expose loading signal', () => {
    expect(component.loading).toBe(mockStateService.loading);
  });

  it('should expose error signal', () => {
    expect(component.error).toBe(mockStateService.error);
  });

  it('should navigate to create page', () => {
    component.onCreate();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/campamentos', 'crear']);
  });

  it('should navigate to detail page', () => {
    component.onSelect('camp-1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/campamentos', 'camp-1']);
  });

  it('should navigate to edit page', () => {
    component.onEdit('camp-1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/campamentos', 'camp-1', 'editar']);
  });

  it('should show confirm dialog and delete', (done) => {
    component.onDelete('camp-1');
    
    setTimeout(() => {
      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('campamento');
      expect(mockStateService.delete).toHaveBeenCalledWith('camp-1');
      done();
    }, 0);
  });
});
