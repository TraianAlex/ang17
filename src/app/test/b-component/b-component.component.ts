import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-b-component',
  standalone: true,
  imports: [],
  templateUrl: './b-component.component.html',
  styleUrl: './b-component.component.scss'
})
export class BComponent {
  @Input() name!: string;
  @Input() bio!: string;
}
