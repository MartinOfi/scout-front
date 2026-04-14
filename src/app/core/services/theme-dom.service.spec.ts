import { TestBed } from '@angular/core/testing';
import { ThemeDomService } from './theme-dom.service';
import {
  THEME_MODE,
  THEME_DOM_ATTRIBUTE,
} from '../../shared/constants/theme.constants';

describe('ThemeDomService', () => {
  let service: ThemeDomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeDomService);
    document.documentElement.removeAttribute(THEME_DOM_ATTRIBUTE);
  });

  it('sets the data-theme attribute to "light"', () => {
    service.applyTheme(THEME_MODE.Light);
    expect(document.documentElement.getAttribute(THEME_DOM_ATTRIBUTE)).toBe('light');
  });

  it('sets the data-theme attribute to "dark"', () => {
    service.applyTheme(THEME_MODE.Dark);
    expect(document.documentElement.getAttribute(THEME_DOM_ATTRIBUTE)).toBe('dark');
  });

  it('overwrites the previous value', () => {
    service.applyTheme(THEME_MODE.Dark);
    service.applyTheme(THEME_MODE.Light);
    expect(document.documentElement.getAttribute(THEME_DOM_ATTRIBUTE)).toBe('light');
  });
});
