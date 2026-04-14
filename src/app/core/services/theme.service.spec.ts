import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { ThemeStorageService } from './theme-storage.service';
import { ThemeDomService } from './theme-dom.service';
import { THEME_MODE } from '../../shared/constants/theme.constants';
import {
  createMockThemeStorage,
  createMockThemeDom,
  type MockThemeStorage,
  type MockThemeDom,
} from '../../shared/testing/theme.test-helpers';

describe('ThemeService', () => {
  let storage: MockThemeStorage;
  let dom: MockThemeDom;

  const buildService = (initial: 'light' | 'dark' | null = null): ThemeService => {
    storage = createMockThemeStorage({ initial });
    dom = createMockThemeDom();
    TestBed.configureTestingModule({
      providers: [
        { provide: ThemeStorageService, useValue: storage },
        { provide: ThemeDomService, useValue: dom },
      ],
    });
    return TestBed.inject(ThemeService);
  };

  it('defaults to light when storage is empty', () => {
    const service = buildService(null);
    expect(service.mode()).toBe(THEME_MODE.Light);
    expect(dom.appliedModes).toEqual([THEME_MODE.Light]);
  });

  it('initializes from stored dark preference', () => {
    const service = buildService(THEME_MODE.Dark);
    expect(service.mode()).toBe(THEME_MODE.Dark);
    expect(dom.appliedModes).toEqual([THEME_MODE.Dark]);
  });

  it('setMode updates the signal and persists', () => {
    const service = buildService(null);
    service.setMode(THEME_MODE.Dark);
    expect(service.mode()).toBe(THEME_MODE.Dark);
    expect(storage.write).toHaveBeenCalledWith(THEME_MODE.Dark);
    expect(dom.appliedModes).toEqual([THEME_MODE.Light, THEME_MODE.Dark]);
  });

  it('toggle flips light to dark', () => {
    const service = buildService(null);
    service.toggle();
    expect(service.mode()).toBe(THEME_MODE.Dark);
    expect(storage.write).toHaveBeenCalledWith(THEME_MODE.Dark);
  });

  it('toggle flips dark to light', () => {
    const service = buildService(THEME_MODE.Dark);
    service.toggle();
    expect(service.mode()).toBe(THEME_MODE.Light);
    expect(storage.write).toHaveBeenCalledWith(THEME_MODE.Light);
  });

  it('setMode twice with the same value still persists both times', () => {
    const service = buildService(null);
    service.setMode(THEME_MODE.Dark);
    service.setMode(THEME_MODE.Dark);
    expect(storage.write).toHaveBeenCalledTimes(2);
  });
});
