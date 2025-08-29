import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-b-component',
    templateUrl: './b-component.component.html',
    styleUrl: './b-component.component.scss',
    standalone: true,
})
export class BComponent {
  @Input() name!: string;
  @Input() bio!: string;
}
