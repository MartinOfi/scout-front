import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { ReasonTextareaComponent } from './reason-textarea.component';

describe('ReasonTextareaComponent', () => {
  let component: ReasonTextareaComponent;
  let fixture: ComponentFixture<ReasonTextareaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, ReasonTextareaComponent],
}).compileComponents();

    fixture = TestBed.createComponent(ReasonTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
