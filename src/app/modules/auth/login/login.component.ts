/**
 * Login Component
 * Smart Component - Handles user authentication
 * Features MagicUI-inspired animations with split layout design
 */

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStateService } from '../services/auth-state.service';
import { EmailInputComponent } from '../../../shared/components/form/email-input/email-input.component';
import { PasswordInputComponent } from '../../../shared/components/form/password-input/password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmailInputComponent,
    PasswordInputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);

  /** Error message from failed login */
  readonly errorMessage = signal<string | null>(null);

  /** Loading state from auth service */
  readonly isLoading = this.authState.isLoading;

  /** Login form with validation */
  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Handle form submission */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authState.login(credentials).subscribe({
      next: () => {
        this.handleSuccessfulLogin();
      },
      error: (err) => {
        this.handleLoginError(err);
      },
    });
  }

  /**
   * Handle successful login - redirect to stored URL or dashboard
   */
  private handleSuccessfulLogin(): void {
    const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
    sessionStorage.removeItem('redirectUrl');
    this.router.navigate([redirectUrl]);
  }

  /**
   * Handle login error - display user-friendly message
   */
  private handleLoginError(error: unknown): void {
    let message = 'Error al iniciar sesión. Por favor, intente nuevamente.';

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;

      // Handle HttpErrorResponse format
      if ('error' in err && err['error'] && typeof err['error'] === 'object') {
        const errorBody = err['error'] as Record<string, unknown>;
        if ('message' in errorBody && typeof errorBody['message'] === 'string') {
          message = errorBody['message'];
        }
      }

      // Handle direct message property
      if ('message' in err && typeof err['message'] === 'string') {
        message = err['message'];
      }

      // Handle 401 specifically
      if ('status' in err && err['status'] === 401) {
        message = 'Credenciales inválidas. Verifique su email y contraseña.';
      }
    }

    this.errorMessage.set(message);
  }
}
