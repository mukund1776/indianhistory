import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Post } from '../../../models/post.model';
import { PostStoreService } from '../../../services/post-store.service';

@Component({
  selector: 'app-post-editor',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.css',
})
export class PostEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PostStoreService);

  readonly isNew = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  private editingId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', Validators.required],
    excerpt: ['', [Validators.required, Validators.maxLength(300)]],
    content: ['', Validators.required],
    tags: [''],
    publishedAt: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    await this.store.whenReady();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const post = this.store.getById(id);
      if (!post) {
        void this.router.navigate(['/admin']);
        return;
      }
      this.isNew.set(false);
      this.editingId = post.id;
      this.form.patchValue({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags.join(', '),
        publishedAt: post.publishedAt.slice(0, 10),
      });
    } else {
      this.form.patchValue({
        publishedAt: new Date().toISOString().slice(0, 10),
      });
    }

    this.form.controls.title.valueChanges.subscribe((title) => {
      if (this.isNew() && !this.slugTouched()) {
        const base = this.store.slugify(title);
        this.form.controls.slug.setValue(this.store.uniqueSlug(base), {
          emitEvent: false,
        });
      }
    });
  }

  private slugTouched(): boolean {
    return this.form.controls.slug.dirty;
  }

  async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const baseSlug = this.store.slugify(raw.slug || raw.title);
    const slug = this.store.uniqueSlug(baseSlug, this.editingId ?? undefined);
    const now = new Date().toISOString();
    const id = this.editingId ?? this.store.newId();
    const post: Post = {
      id,
      slug,
      title: raw.title.trim(),
      excerpt: raw.excerpt.trim(),
      content: raw.content.trim(),
      publishedAt: new Date(raw.publishedAt).toISOString(),
      updatedAt: now,
      tags: raw.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    this.saving.set(true);
    try {
      await this.store.save(post);
      void this.router.navigate(['/post', post.slug]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      this.saving.set(false);
    }
  }

  cancelTo(): string[] {
    return this.isNew() ? ['/admin'] : ['/admin'];
  }
}