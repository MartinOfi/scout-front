/**
 * Login Component
 * Smart Component - Autenticación
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  constructor(private router: Router) {}

  onLogin(): void {
    // TODO: Implementar autenticación real
    localStorage.setItem('auth_token', 'fake-token');
    this.router.navigate(['/dashboard']);
  }
}
