import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeStorageService } from '../../../core/services/theme-storage.service';
import { ThemeDomService } from '../../../core/services/theme-dom.service';
import { THEME_MODE } from '../../../shared/constants/theme.constants';
import {
  createMockThemeStorage,
  createMockThemeDom,
} from '../../../shared/testing/theme.test-helpers';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: ThemeService;

  const build = (initial: 'light' | 'dark' | null = null): void => {
    TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [
        { provide: ThemeStorageService, useValue: createMockThemeStorage({ initial }) },
        { provide: ThemeDomService, useValue: createMockThemeDom() },
      ],
    });
    fixture = TestBed.createComponent(ThemeToggleComponent);
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  };

  const getCheckbox = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('input.theme-switch__checkbox');

  it('renders unchecked when the theme is light', () => {
    build(null);
    expect(getCheckbox().checked).toBe(false);
  });

  it('renders checked when the theme is dark', () => {
    build(THEME_MODE.Dark);
    expect(getCheckbox().checked).toBe(true);
  });

  it('sets dark mode when the checkbox becomes checked', () => {
    build(null);
    const input = getCheckbox();
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(themeService.mode()).toBe(THEME_MODE.Dark);
  });

  it('sets light mode when the checkbox becomes unchecked', () => {
    build(THEME_MODE.Dark);
    const input = getCheckbox();
    input.checked = false;
    input.dispatchEvent(new Event('change'));
    expect(themeService.mode()).toBe(THEME_MODE.Light);
  });
});
