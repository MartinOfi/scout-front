import { TestBed } from '@angular/core/testing';
import { ThemeStorageService } from './theme-storage.service';
import { THEME_MODE, THEME_STORAGE_KEY } from '../../shared/constants/theme.constants';

describe('ThemeStorageService', () => {
  let service: ThemeStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns null when no value is stored', () => {
    expect(service.read()).toBeNull();
  });

  it('persists a valid mode and reads it back', () => {
    service.write(THEME_MODE.Dark);
    expect(service.read()).toBe(THEME_MODE.Dark);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_MODE.Dark);
  });

  it('clears the stored preference', () => {
    service.write(THEME_MODE.Dark);
    service.clear();
    expect(service.read()).toBeNull();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('returns null for invalid stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'system');
    expect(service.read()).toBeNull();
  });

  it('falls back to memory when localStorage throws', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceeded');
    };

    service.write(THEME_MODE.Dark);
    expect(service.read()).toBe(THEME_MODE.Dark);

    Storage.prototype.setItem = originalSetItem;
  });
});
