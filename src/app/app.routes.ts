import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { PostEditorComponent } from './pages/admin/post-editor/post-editor.component';
import { HomeComponent } from './pages/home/home.component';
import { PostDetailComponent } from './pages/post-detail/post-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'post/:slug', component: PostDetailComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/new', component: PostEditorComponent },
  { path: 'admin/edit/:id', component: PostEditorComponent },
  { path: '**', redirectTo: '' },
];