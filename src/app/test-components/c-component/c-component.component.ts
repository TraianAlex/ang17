import { Component, input } from '@angular/core';

@Component({
    selector: 'app-c-component',
    imports: [],
    standalone: true,
    templateUrl: './c-component.component.html',
    styleUrl: './c-component.component.scss'
})
export class CComponent {
  readonly propC1 = input.required<string>();
  readonly propC2 = input.required<string>();
}
