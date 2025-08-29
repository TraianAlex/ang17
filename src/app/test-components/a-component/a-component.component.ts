import { Component, input } from '@angular/core';

@Component({
    selector: 'app-a-component',
    templateUrl: './a-component.component.html',
    styleUrl: './a-component.component.scss',
    standalone: true,
})
export class AComponent {
  readonly headline = input.required<string>();
  readonly body = input.required<string>();
}
