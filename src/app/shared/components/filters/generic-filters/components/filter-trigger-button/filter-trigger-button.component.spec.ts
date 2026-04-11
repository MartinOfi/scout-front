import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterTriggerButtonComponent } from './filter-trigger-button.component';

describe('FilterTriggerButtonComponent', () => {
  let fixture: ComponentFixture<FilterTriggerButtonComponent>;
  let component: FilterTriggerButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterTriggerButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterTriggerButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeCount', 0);
    fixture.detectChanges();
  });

  it('should show the "Filtrar" label when activeCount is 0', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Filtrar');
  });

  it('should hide the label when activeCount > 0', () => {
    fixture.componentRef.setInput('activeCount', 3);
    fixture.detectChanges();
    const label = (fixture.nativeElement as HTMLElement).querySelector('.trigger__label');
    expect(label).toBeNull();
  });

  it('should emit clicked on button click', () => {
    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();
    expect(emitted).toBe(true);
  });
});
