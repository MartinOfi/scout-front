import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-form-field',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './form-field.component.html',
    styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent {
  @Input() label: string = '';
  readonly required = input<boolean>(false);
  @Input() hint?: string;
  readonly forId = input<string>();
  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}
