import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-form-container',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './form-container.component.html',
    styleUrls: ['./form-container.component.scss']
})
export class FormContainerComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon?: string;
  readonly density = input<'comfortable' | 'compact'>('comfortable');
  readonly divider = input<boolean>(true);
  readonly columns = input<1 | 2>(1);
}
