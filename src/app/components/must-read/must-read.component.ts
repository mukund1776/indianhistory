import { Component } from '@angular/core';
import { recommendedBooks } from '../../data/recommended-books';
import { LazyImageDirective } from '../../directives/lazy-image.directive';

@Component({
  selector: 'app-must-read',
  imports: [LazyImageDirective],
  templateUrl: './must-read.component.html',
  styleUrl: './must-read.component.css',
})
export class MustReadComponent {
  readonly books = recommendedBooks;
}
