import { Component, input } from '@angular/core';

@Component({
    selector: 'app-b-component',
    templateUrl: './b-component.component.html',
    styleUrl: './b-component.component.scss',
    standalone: true,
})
export class BComponent {
  readonly name = input<string>();
  readonly bio = input<string>();
}
