/**
 * Documentacion Card Component
 * Displays documentation checklist for Protagonistas
 * Uses auth-grid/auth-item pattern from inscripcion-detail
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DocumentacionPersonal } from '../../../../models';

interface DocItem {
  key: keyof DocumentacionPersonal;
  label: string;
}

@Component({
  selector: 'app-documentacion-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './documentacion-card.component.html',
  styleUrl: './documentacion-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentacionCardComponent {
  readonly documentacion = input.required<DocumentacionPersonal>();

  readonly docItems: DocItem[] = [
    { key: 'partidaNacimiento', label: 'Partida de Nacimiento' },
    { key: 'dni', label: 'DNI' },
    { key: 'dniPadres', label: 'DNI Padres' },
    { key: 'carnetObraSocial', label: 'Carnet Obra Social' },
  ];
}
