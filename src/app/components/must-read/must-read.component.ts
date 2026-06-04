import { Component } from '@angular/core';
import { recommendedBooks } from '../../data/recommended-books';

@Component({
  selector: 'app-must-read',
  imports: [],
  templateUrl: './must-read.component.html',
  styleUrl: './must-read.component.css',
})
export class MustReadComponent {
  readonly books = recommendedBooks;
}
