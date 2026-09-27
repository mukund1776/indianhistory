import { Component, Input, inject } from '@angular/core';
import { LazyImageDirective } from '../../directives/lazy-image.directive';
import { RecommendedBook } from '../../models/book.model';
import { LocaleService } from '../../i18n/locale.service';

@Component({
  selector: 'app-book-sidebar',
  imports: [LazyImageDirective],
  templateUrl: './book-sidebar.component.html',
  styleUrl: './book-sidebar.component.css',
})
export class BookSidebarComponent {
  readonly locale = inject(LocaleService);
  @Input() book: RecommendedBook | null = null;
}
