import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-c-component',
  standalone: true,
  imports: [],
  templateUrl: './c-component.component.html',
  styleUrl: './c-component.component.scss',
})
export class CComponent {
  @Input() propC1!: string;
  @Input() propC2!: string;
}
