import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EmailInputComponent } from './email-input.component';

describe('EmailInputComponent', () => {
  let component: EmailInputComponent;
  let fixture: ComponentFixture<EmailInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, EmailInputComponent],
}).compileComponents();

    fixture = TestBed.createComponent(EmailInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default placeholder', () => {
    expect(component.placeholder()).toBe('Ingresa tu correo electrónico');
  });

  it('should have default label', () => {
    expect(component.label()).toBe('Correo electrónico');
  });

  it('should implement ControlValueAccessor', () => {
    const mockFn = jasmine.createSpy('mockFn');
    component.registerOnChange(mockFn);
    component.registerOnTouched(mockFn);

    expect(component.onChange).toBe(mockFn);
    expect(component.onTouched).toBe(mockFn);
  });
});
