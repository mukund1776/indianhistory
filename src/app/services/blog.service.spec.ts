import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { BlogService } from './blog.service';
import { LocaleService } from '../i18n/locale.service';
import { BlogPost } from '../models/blog.model';

describe('BlogService', () => {
  let service: BlogService;
  let requestedUrls: string[];
  const samplePosts: BlogPost[] = [
    {
      slug: 'welcome-to-indian-history',
      title: 'Welcome to India History',
      excerpt: 'Introduction to our digital history platform.',
      html: '<p>Welcome!</p>',
      publishedAt: '2026-03-01',
      tags: ['Introduction'],
    },
    {
      slug: 'archaeological-methods',
      title: 'Dating and Stratigraphy in Archaeology',
      excerpt: 'How modern science dates prehistoric sites.',
      html: '<p>Luminescence dating etc.</p>',
      publishedAt: '2026-03-10',
      tags: ['Science', 'Archaeology'],
    },
  ];

  beforeEach(() => {
    requestedUrls = [];
    const mockHttp = {
      get: (url: string) => { requestedUrls.push(url); return of(samplePosts); },
    };

    const mockLocale = {
      language: 'en',
      generatedAssetsBase: '/indianhistory/assets/generated/',
      translationAvailable: { set: () => {} },
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: LocaleService, useValue: mockLocale },
      ],
    });

    service = runInInjectionContext(injector, () => new BlogService());
    (service as any).posts.set(samplePosts);
  });

  it('should retrieve blog post by slug', () => {
    const post = service.getBySlug('welcome-to-indian-history');
    expect(post).toBeDefined();
    expect(post?.title).toBe('Welcome to India History');

    const notFound = service.getBySlug('non-existent');
    expect(notFound).toBeUndefined();
  });

  it('should expose allPosts signal', () => {
    const posts = service.allPosts();
    expect(posts.length).toBe(2);
    expect(posts[1].slug).toBe('archaeological-methods');
  });

  it('loads blog data under the deployment base URL', async () => {
    await service.whenReady();
    expect(requestedUrls).toEqual(['/indianhistory/assets/generated/blogs.json']);
  });
});
