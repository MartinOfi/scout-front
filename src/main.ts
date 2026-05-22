import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeEsAr, 'es-AR');

// Evita que la rueda del mouse modifique el valor de los <input type="number">.
// Requiere passive:false para poder cancelar la acción default del browser
// (incremento/decremento del valor). Solo se cancela cuando el target es un
// number input enfocado; el resto del scroll de la página no se ve afectado.
document.addEventListener(
  'wheel',
  (event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      target.type === 'number' &&
      document.activeElement === target
    ) {
      event.preventDefault();
    }
  },
  { passive: false },
);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
