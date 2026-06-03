import { Component, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    // Set exact pixel height of the sticky header so that fragment navigation
    // (Timeline / Empires / Kingdoms links) scrolls the target just below the header
    // instead of hiding the section title behind it.
    const header = document.querySelector('.site-header') as HTMLElement | null;
    if (header) {
      document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    }
  }
}