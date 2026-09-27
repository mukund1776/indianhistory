import { Component, Input, inject } from '@angular/core';
import { LazyImageDirective } from '../../directives/lazy-image.directive';
import { RecommendedBook } from '../../models/book.model';
import { LocaleService } from '../../i18n/locale.service';
import { DevModeService } from '../../services/dev-mode.service';

@Component({
  selector: 'app-book-sidebar',
  imports: [LazyImageDirective],
  templateUrl: './book-sidebar.component.html',
  styleUrl: './book-sidebar.component.css',
})
export class BookSidebarComponent {
  readonly locale = inject(LocaleService);
  readonly devMode = inject(DevModeService);
  @Input() book: RecommendedBook | null = null;
}
