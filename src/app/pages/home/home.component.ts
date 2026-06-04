import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';
import { Period, Personality, Polity, PolityKind, Theme } from '../../data/periods';

interface TimelinePeriod {
  slug: string;
  name: string;
  range: string;
  description: string;
  articleCount: number;
}

interface PolityDisplay {
  slug: string;
  name: string;
  range: string;
  description: string;
  articleCount: number;
  period: string;
  kind: PolityKind;
}

interface ThemeDisplay extends Theme {
  articleCount: number;
}

interface PersonalityDisplay extends Personality {
  articleCount: number;
}

interface StoryThumbnail {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly articlesSvc = inject(ArticleService);
  private readonly periodsSvc = inject(PeriodsService);

  readonly list = signal<Article[]>([]);
  readonly loading = signal(true);
  readonly timelinePeriods = signal<TimelinePeriod[]>([]);
  readonly themes = signal<ThemeDisplay[]>([]);
  readonly personalities = signal<PersonalityDisplay[]>([]);
  readonly empires = signal<PolityDisplay[]>([]);
  readonly regionalKingdoms = signal<PolityDisplay[]>([]);

  async ngOnInit(): Promise<void> {
    await this.articlesSvc.whenReady();

    // Visual "Long Arc" on home: the broad top-level periods only.
    // Sub-periods (e.g. Mauryan, Mughal) appear when you drill into their parent period.
    // Counts include articles in sub-periods.
    const displaySlugs = ['prehistory', 'indus-valley', 'early-historic', 'classical', 'medieval', 'colonial', 'modern'];
    const withCounts: TimelinePeriod[] = [];

    for (const slug of displaySlugs) {
      const p = this.periodsSvc.getBySlug(slug);
      if (!p) continue;
      const count = await this.periodsSvc.getArticleCount(slug);
      withCounts.push({
        slug: p.slug,
        name: p.name,
        range: p.range,
        description: p.shortDescription,
        articleCount: count,
      });
    }

    this.timelinePeriods.set(withCounts);

    const themeDisplays: ThemeDisplay[] = [];
    for (const theme of this.periodsSvc.getThemes()) {
      const count = await this.periodsSvc.getArticleCountForTheme(theme.slug);
      themeDisplays.push({
        ...theme,
        articleCount: count,
      });
    }
    this.themes.set(themeDisplays);

    const personalityDisplays: PersonalityDisplay[] = [];
    for (const personality of this.periodsSvc.getPersonalities()) {
      const count = await this.periodsSvc.getArticleCountForPersonality(personality.slug);
      personalityDisplays.push({
        ...personality,
        articleCount: count,
      });
    }
    this.personalities.set(personalityDisplays);

    // Load empires and regional kingdoms separately for two distinct deep-dive sections.
    // Each article can still appear under a broad period (via `period`) *and* under its specific polity (via `polity` frontmatter).
    const empirePolities = this.periodsSvc.getEmpires();
    const rkPolities = this.periodsSvc.getRegionalKingdoms();

    const empireDisplays: PolityDisplay[] = [];
    for (const p of empirePolities) {
      const count = await this.periodsSvc.getArticleCountForPolity(p.slug);
      empireDisplays.push({
        slug: p.slug,
        name: p.name,
        range: p.range,
        description: p.shortDescription,
        articleCount: count,
        period: p.period,
        kind: p.kind,
      });
    }
    this.empires.set(empireDisplays);

    const rkDisplays: PolityDisplay[] = [];
    for (const p of rkPolities) {
      const count = await this.periodsSvc.getArticleCountForPolity(p.slug);
      rkDisplays.push({
        slug: p.slug,
        name: p.name,
        range: p.range,
        description: p.shortDescription,
        articleCount: count,
        period: p.period,
        kind: p.kind,
      });
    }
    this.regionalKingdoms.set(rkDisplays);

    this.list.set(this.pickRandomArticles(this.articlesSvc.allArticles(), 3));
    this.loading.set(false);
  }

  private pickRandomArticles(articles: Article[], count: number): Article[] {
    if (articles.length === 0) {
      return [];
    }

    return [...articles]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, articles.length));
  }

  thumbnail(article: Article): StoryThumbnail | null {
    const img = article.html.match(/<img\b[^>]*>/i)?.[0];
    if (!img) {
      return null;
    }

    const src = this.getAttribute(img, 'src');
    if (!src) {
      return null;
    }

    return {
      src,
      alt: this.getAttribute(img, 'alt') ?? '',
    };
  }

  private getAttribute(tag: string, name: string): string | null {
    return tag.match(new RegExp(`${name}="([^"]*)"`, 'i'))?.[1] ?? null;
  }
}
