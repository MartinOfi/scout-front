import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-reason-textarea',
    templateUrl: './reason-textarea.component.html',
    styleUrls: ['./reason-textarea.component.scss'],
    imports: [NgClass, ReactiveFormsModule]
})
export class ReasonTextareaComponent {
  readonly control = input.required<FormControl>();
  readonly label = input<string>('edit-ticket-modal.form.label');
  readonly placeholder = input<string>('edit-ticket-modal.form.placeholder');
  readonly customClass = input<string>('');
}
