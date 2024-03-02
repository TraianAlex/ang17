import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-e-component',
  standalone: true,
  imports: [],
  templateUrl: './e-component.component.html',
  styleUrl: './e-component.component.scss'
})
export class EComponent {
  @Input() item: any;
}
