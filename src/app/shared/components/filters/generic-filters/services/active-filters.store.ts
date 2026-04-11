import { Injectable, Signal, computed, signal } from '@angular/core';
import { ActiveFilter } from '../active-filter.interface';
import { FilterOperator } from '../filter-operator.enum';
import { FilterValue, FilterValueMap } from '../filter-value.type';

export interface UpdateValueParams {
  readonly key: string;
  readonly value: FilterValue;
}

export interface UpdateOperatorParams {
  readonly key: string;
  readonly operator: FilterOperator;
}

/**
 * Store local (scope = componente) para los filtros activos.
 *
 * No se provee en `root` — cada `GenericFiltersComponent` inyecta su propia
 * instancia a través de su `providers: [ActiveFiltersStore]`. Esto evita
 * compartir estado entre páginas sin necesidad de `@Input`/`@Output` manuales.
 *
 * Todas las mutaciones devuelven listas nuevas (inmutabilidad vía spread).
 */
@Injectable()
export class ActiveFiltersStore {
  private readonly state = signal<readonly ActiveFilter[]>([]);

  readonly list: Signal<readonly ActiveFilter[]> = this.state.asReadonly();

  readonly hasActive: Signal<boolean> = computed(() => this.state().length > 0);

  readonly valueMap: Signal<FilterValueMap> = computed(() => {
    const result: Record<string, FilterValue> = {};
    for (const filter of this.state()) {
      result[filter.key] = filter.value;
    }
    return result;
  });

  add(filter: ActiveFilter): void {
    this.state.update((current) => {
      const withoutKey = current.filter((f) => f.key !== filter.key);
      return [...withoutKey, filter];
    });
  }

  remove(key: string): void {
    this.state.update((current) => current.filter((f) => f.key !== key));
  }

  updateValue(params: UpdateValueParams): void {
    this.state.update((current) =>
      current.map((f) => (f.key === params.key ? { ...f, value: params.value } : f)),
    );
  }

  updateOperator(params: UpdateOperatorParams): void {
    this.state.update((current) =>
      current.map((f) => (f.key === params.key ? { ...f, operator: params.operator } : f)),
    );
  }

  clear(): void {
    this.state.set([]);
  }

  hydrate(filters: readonly ActiveFilter[]): void {
    this.state.set([...filters]);
  }
}
