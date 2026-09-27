import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DevModeService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  readonly isDevMode = signal<boolean>(false);

  constructor() {
    this.updateFromUrl();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateFromUrl();
      });

    const win = this.document.defaultView as (Window & typeof globalThis & {
      __DEV_MODE__?: () => boolean;
      setDevMode?: (enable: boolean) => void;
    }) | null;

    if (win) {
      win.__DEV_MODE__ = () => this.isDevMode();
      win.setDevMode = (enable: boolean) => this.setDevMode(enable);
    }
  }

  private updateFromUrl(): void {
    const search = this.document.location?.search || '';
    const params = new URLSearchParams(search);
    const devParam = params.get('dev');
    if (devParam !== null) {
      const enabled = devParam !== 'false' && devParam !== '0';
      this.isDevMode.set(enabled);
      try {
        if (enabled) {
          sessionStorage.setItem('ih_dev_mode', 'true');
        } else {
          sessionStorage.removeItem('ih_dev_mode');
        }
      } catch {
        // Ignore sessionStorage errors in restricted contexts
      }
    } else {
      let stored = false;
      try {
        stored = sessionStorage.getItem('ih_dev_mode') === 'true';
      } catch {
        // Ignore sessionStorage errors
      }
      this.isDevMode.set(stored);
    }
  }

  setDevMode(enable: boolean): void {
    try {
      if (enable) {
        sessionStorage.setItem('ih_dev_mode', 'true');
      } else {
        sessionStorage.removeItem('ih_dev_mode');
      }
    } catch {
      // Ignore sessionStorage errors
    }
    this.isDevMode.set(enable);
    void this.router.navigate([], {
      queryParams: { dev: enable ? 'true' : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
