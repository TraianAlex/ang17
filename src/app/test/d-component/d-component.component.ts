import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-d-component',
  standalone: true,
  imports: [],
  templateUrl: './d-component.component.html',
  styleUrl: './d-component.component.scss',
})
export class DComponent {
  @Input() propD1!: string;
  @Input() propD2!: string;
}
