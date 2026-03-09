import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordInputComponent } from './password-input.component';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, PasswordInputComponent],
}).compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default placeholder', () => {
    expect(component.placeholder()).toBe('Ingresa tu contraseña');
  });

  it('should have default label', () => {
    expect(component.label()).toBe('Contraseña');
  });

  it('should implement ControlValueAccessor', () => {
    const mockFn = jasmine.createSpy('mockFn');
    component.registerOnChange(mockFn);
    component.registerOnTouched(mockFn);

    expect(component.onChange).toBe(mockFn);
    expect(component.onTouched).toBe(mockFn);
  });
});
