import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-e-component',
    imports: [],
    standalone: true,
    templateUrl: './e-component.component.html',
    styleUrl: './e-component.component.scss'
})
export class EComponent {
  @Input() item: any;
}
