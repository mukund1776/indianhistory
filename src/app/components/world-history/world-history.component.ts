import { Component, inject } from '@angular/core';
import { worldHistoryEvents } from '../../data/world-history';
import { LocaleService } from '../../i18n/locale.service';

@Component({
  selector: 'app-world-history',
  templateUrl: './world-history.component.html',
  styleUrl: './world-history.component.css',
})
export class WorldHistoryComponent {
  private readonly locale = inject(LocaleService);
  readonly events = worldHistoryEvents.map(event => ({
    date: this.locale.translate(event.date),
    title: this.locale.translate(event.title),
    summary: this.locale.translate(event.summary),
  }));
}
