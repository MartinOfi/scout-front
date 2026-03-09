/**
 * ButtonTabs Component
 *
 * Reusable button-style tabs component with customizable styling.
 * Uses burgundy (#812128) for active tab, white for inactive.
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Configuration for a single tab
 */
export interface TabConfig {
  /** Unique identifier for the tab */
  key: string;
  /** Display label for the tab */
  label: string;
  /** Material icon name */
  icon: string;
}

@Component({
  selector: 'app-button-tabs',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './button-tabs.component.html',
  styleUrl: './button-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonTabsComponent {
  /** Array of tab configurations */
  readonly tabs = input.required<TabConfig[]>();

  /** Key of the currently active tab */
  readonly activeTab = input<string>('');

  /** Emits when a tab is clicked */
  readonly tabChange = output<string>();

  onTabClick(key: string): void {
    this.tabChange.emit(key);
  }
}
