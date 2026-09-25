import { Component, Input } from '@angular/core';
import { LazyImageDirective } from '../../directives/lazy-image.directive';
import { RecommendedBook } from '../../models/book.model';

@Component({
  selector: 'app-book-sidebar',
  imports: [LazyImageDirective],
  templateUrl: './book-sidebar.component.html',
  styleUrl: './book-sidebar.component.css',
})
export class BookSidebarComponent {
  @Input() book: RecommendedBook | null = null;
}
