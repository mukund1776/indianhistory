import { Component } from '@angular/core';
import { worldHistoryEvents } from '../../data/world-history';

@Component({
  selector: 'app-world-history',
  templateUrl: './world-history.component.html',
  styleUrl: './world-history.component.css',
})
export class WorldHistoryComponent {
  readonly events = worldHistoryEvents;
}
