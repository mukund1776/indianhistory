import { ViewportScroller } from '@angular/common';
import { Component, AfterViewInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  private readonly viewportScroller = inject(ViewportScroller);

  ngAfterViewInit(): void {
    // Set exact pixel height of the sticky header so that fragment navigation
    // (Timeline / Empires / Kingdoms links) scrolls the target just below the header
    // instead of hiding the section title behind it.
    this.viewportScroller.setOffset(() => [0, this.headerOffset()]);
    document.documentElement.style.setProperty('--header-height', `${this.headerOffset()}px`);
  }

  private headerOffset(): number {
    const header = document.querySelector('.site-header') as HTMLElement | null;
    return header ? header.offsetHeight + 12 : 0;
  }
}
