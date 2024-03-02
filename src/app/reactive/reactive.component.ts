import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'rx-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ContentComponent, FooterComponent],
  template: `
    <rx-header></rx-header>
    <!-- <rx-content></rx-content> -->
    <router-outlet />
    <rx-footer></rx-footer>
  `,
  styleUrls: ['./reactive.component.scss'],
})
export class ReactiveComponent {}
