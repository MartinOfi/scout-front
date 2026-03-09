import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipsFilterComponent } from './chips-filter.component';
import { ChipConfig } from './chip-config.interface';

describe('ChipsFilterComponent', () => {
  let component: ChipsFilterComponent;
  let fixture: ComponentFixture<ChipsFilterComponent>;

  const mockChips: ChipConfig[] = [
    { value: null, label: 'Todos' },
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipsFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipsFilterComponent);
    component = fixture.componentInstance;
    component.chips = mockChips;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit chipSelected on single selection', () => {
    spyOn(component.chipSelected, 'emit');
    component.allowMultiple = false;
    component.onChipClick(1);
    expect(component.chipSelected.emit).toHaveBeenCalledWith('day');
  });

  it('should emit chipsSelected on multiple selection', () => {
    spyOn(component.chipsSelected, 'emit');
    component.allowMultiple = true;
    component.onChipClick(1);
    expect(component.chipsSelected.emit).toHaveBeenCalled();
  });

  it('should handle "Todos" chip in multiple selection', () => {
    component.allowMultiple = true;
    component.selectedValues = ['day', 'week'];
    component.onChipClick(0); // Click en "Todos"
    expect(component.selectedValues).toEqual([null]);
  });

  it('should return correct styles for active chip', () => {
    component.selectedValue = 'day';
    const styles = component.getChipStyles(mockChips[1], 1);
    expect(styles['background-color']).toBeDefined();
  });

  it('should handle disabled chips', () => {
    const disabledChip: ChipConfig = { value: 'test', label: 'Test', disabled: true };
    component.chips = [disabledChip];
    const styles = component.getChipStyles(disabledChip, 0);
    expect(styles['cursor']).toBe('not-allowed');
  });
});

