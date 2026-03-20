import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-active-users',
  imports: [],
  templateUrl: './active-users.html',
  styleUrl: './active-users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveUsersComponent {
  users = input<string[]>([]);
}
