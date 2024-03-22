import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-a-component',
  standalone: true,
  imports: [],
  templateUrl: './a-component.component.html',
  styleUrl: './a-component.component.scss',
})
export class AComponent {
  @Input() headline!: string;
  @Input() body!: string;
}
