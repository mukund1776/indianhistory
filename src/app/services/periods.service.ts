import { Injectable, inject } from '@angular/core';
import { Article, SearchResult, SearchResultKind } from '../models/article.model';
import { ArticleService } from './article.service';
import {
  Period,
  Polity,
  PolityKind,
  findParent,
  findPeriod,
  getSubtreeSlugs,
  getTopLevelPeriods,
  periods,
  polities,
} from '../data/periods';

@Injectable({ providedIn: 'root' })
export class PeriodsService {
  private readonly articlesService = inject(ArticleService);

  /** All root periods (for home overview etc.) */
  getTopLevel(): Period[] {
    return getTopLevelPeriods();
  }

  /** Find any period (including nested) by slug */
  getBySlug(slug: string): Period | undefined {
    return findPeriod(slug);
  }

  /** Find the direct parent period (if any) */
  getParent(slug: string): Period | undefined {
    return findParent(slug);
  }

  /** Get all periods flattened (useful for counts etc.) */
  getAll(): Period[] {
    const all: Period[] = [];
    const walk = (list: Period[]) => {
      for (const p of list) {
        all.push(p);
        if (p.children) walk(p.children);
      }
    };
    walk(periods);
    return all;
  }

  /**
   * Return articles whose `period` field matches this node or any descendant.
   * Falls back to tag-based matching for older articles if needed.
   */
  async getArticlesForPeriod(slug: string): Promise<Article[]> {
    await this.articlesService.whenReady();
    const all = this.articlesService.allArticles();
    const p = this.getBySlug(slug);
    if (!p) return [];

    const allowedSlugs = new Set(getSubtreeSlugs(p));

    return all.filter((a) => {
      if (a.period && allowedSlugs.has(a.period)) {
        return true;
      }
      // Fallback: very loose tag matching for the early articles (can be removed later)
      const lowerTags = a.tags.map((t) => t.toLowerCase());
      if (slug === 'mauryan' || slug === 'early-historic') {
        return lowerTags.includes('empire') || lowerTags.includes('mauryan');
      }
      if (slug === 'indus-valley') {
        return lowerTags.includes('indus') || lowerTags.includes('harappan') || lowerTags.includes('sindhu') || lowerTags.includes('saraswati');
      }
      return false;
    });
  }

  /** Count of articles under a period (including subtree) */
  async getArticleCount(slug: string): Promise<number> {
    const arts = await this.getArticlesForPeriod(slug);
    return arts.length;
  }

  /** All polities / empires / kingdoms */
  getPolities(): Polity[] {
    return polities;
  }

  /** Major empires (pan-subcontinental or imperial scale) */
  getEmpires(): Polity[] {
    return polities.filter((p) => p.kind === 'empire');
  }

  /** Regional kingdoms, sultanates, and successor states */
  getRegionalKingdoms(): Polity[] {
    return polities.filter((p) => p.kind === 'regional-kingdom');
  }

  /** Find a polity by slug */
  getPolityBySlug(slug: string): Polity | undefined {
    return polities.find((p) => p.slug === slug);
  }

  /**
   * Return articles whose `polity` field matches this slug.
   */
  async getArticlesForPolity(slug: string): Promise<Article[]> {
    await this.articlesService.whenReady();
    const all = this.articlesService.allArticles();
    const polity = this.getPolityBySlug(slug);
    if (!polity) return [];

    return all.filter((a) => {
      if (a.polity === slug) {
        return true;
      }
      // Fallback using tags for older articles
      const lowerTags = a.tags.map((t) => t.toLowerCase());
      if (slug === 'maurya' || slug === 'mughal') {
        return lowerTags.includes('empire') || lowerTags.includes(slug);
      }
      return false;
    });
  }

  /** Count of articles for a specific polity */
  async getArticleCountForPolity(slug: string): Promise<number> {
    const arts = await this.getArticlesForPolity(slug);
    return arts.length;
  }

  /**
   * Unified search across:
   * - Articles (stories)
   * - All periods (top-level + sub-periods like Mauryan, Mature Phase, etc.)
   * - All polities (empires + regional kingdoms)
   *
   * Results are ranked so that title matches come first, then by kind (articles slightly preferred), then alpha.
   */
  async searchAll(query: string): Promise<SearchResult[]> {
    await this.articlesService.whenReady();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    // Articles via the existing pre-built index (includes full body text)
    const articleHits = this.articlesService.search(query);
    for (const a of articleHits) {
      results.push({
        kind: 'article',
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        routerLink: ['/article', a.slug],
        queryParams: { fromSearch: true },
        kindLabel: 'Story',
      });
    }

    // All periods (flattened tree so sub-periods like 'mauryan' or 'mature-harappan' are findable)
    const allPeriods = this.getAll();
    for (const p of allPeriods) {
      const haystack = `${p.name} ${p.shortDescription} ${p.description} ${p.range}`.toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          kind: 'period',
          slug: p.slug,
          title: p.name,
          excerpt: p.shortDescription || (p.description ? p.description.slice(0, 160) : ''),
          routerLink: ['/period', p.slug],
          queryParams: { fromSearch: true },
          kindLabel: 'Period',
        });
      }
    }

    // All polities (empires and regional kingdoms)
    const allPolities = this.getPolities();
    for (const pol of allPolities) {
      const haystack = `${pol.name} ${pol.shortDescription} ${pol.description} ${pol.range}`.toLowerCase();
      if (haystack.includes(q)) {
        const isEmpire = pol.kind === 'empire';
        results.push({
          kind: 'polity',
          slug: pol.slug,
          title: pol.name,
          excerpt: pol.shortDescription || (pol.description ? pol.description.slice(0, 160) : ''),
          routerLink: ['/polity', pol.slug],
          queryParams: { fromSearch: true },
          kindLabel: isEmpire ? 'Empire' : 'Regional Kingdom',
        });
      }
    }

    // De-duplicate (in case of slug collisions across kinds, though unlikely)
    const seen = new Set<string>();
    const unique: SearchResult[] = [];
    for (const r of results) {
      const key = `${r.kind}:${r.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }

    // Rank: prefer title hits that start with the query, then contain, then by kind (Story first), then name
    const kindRank: Record<SearchResultKind, number> = { article: 0, period: 1, polity: 2 };
    unique.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aScore = aTitle.startsWith(q) ? 0 : aTitle.includes(q) ? 1 : 2;
      const bScore = bTitle.startsWith(q) ? 0 : bTitle.includes(q) ? 1 : 2;
      if (aScore !== bScore) return aScore - bScore;
      if (kindRank[a.kind] !== kindRank[b.kind]) return kindRank[a.kind] - kindRank[b.kind];
      return a.title.localeCompare(b.title);
    });

    return unique;
  }
}
