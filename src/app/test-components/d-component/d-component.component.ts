import { Component, input } from '@angular/core';

@Component({
    selector: 'app-d-component',
    imports: [],
    standalone: true,
    templateUrl: './d-component.component.html',
    styleUrl: './d-component.component.scss'
})
export class DComponent {
  readonly propD1 = input.required<string>();
  readonly propD2 = input.required<string>();
}
