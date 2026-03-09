import { ChangeDetectionStrategy, Component, input } from '@angular/core';


@Component({
    selector: 'app-time-field',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-field.component.html',
    styleUrls: ['./time-field.component.scss']
})
export class TimeFieldComponent {
  readonly id = input<string>();
  readonly disabled = input<boolean>(false);
  readonly placeholder = input<string>('Seleccione una hora');
  readonly required = input<boolean>(false);
  readonly errorMessage = input<string>('');
  readonly label = input<string>('');
}
