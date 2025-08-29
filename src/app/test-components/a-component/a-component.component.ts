import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-a-component',
    templateUrl: './a-component.component.html',
    styleUrl: './a-component.component.scss',
    standalone: true,
})
export class AComponent {
  @Input() headline!: string;
  @Input() body!: string;
}
