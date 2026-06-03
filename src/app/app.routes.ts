import { Routes } from '@angular/router';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { HomeComponent } from './pages/home/home.component';
import { PeriodDetailComponent } from './pages/period-detail/period-detail.component';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'article/:slug', component: ArticleDetailComponent },
  { path: 'post/:slug', redirectTo: 'article/:slug', pathMatch: 'full' },
  { path: 'period/:slug', component: PeriodDetailComponent },
  { path: 'polity/:slug', component: PeriodDetailComponent },
  { path: '**', redirectTo: '' },
];