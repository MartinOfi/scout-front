import {
  ChangeDetectionStrategy,
  Component,
  output,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-form-actions',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './form-actions.component.html',
    styleUrls: ['./form-actions.component.scss']
})
export class FormActionsComponent {
  readonly borderTop = input<boolean>(true);
  readonly align = input<'end' | 'start' | 'between'>('end');
  readonly dense = input<boolean>(false);

  readonly cancel = output<void>();
}
