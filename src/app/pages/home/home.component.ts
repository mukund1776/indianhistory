import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostStoreService } from '../../services/post-store.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly store = inject(PostStoreService);
  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.store.whenReady();
    this.posts.set(this.store.allPosts());
    this.loading.set(false);
  }
}