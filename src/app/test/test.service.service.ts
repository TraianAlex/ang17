import { Injectable } from '@angular/core';
import { AComponent } from './a-component/a-component.component';
import { BComponent } from './b-component/b-component.component';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  getAds() {
    return {
      compA: {
        component: AComponent,
        inputs: { name: 'Dr. IQ', bio: 'Smart as they come' },
      },
      compB: {
        component: BComponent,
        inputs: {
          headline: 'Hiring for several positions',
          body: 'Submit your resume today!',
        },
      },
    } as any;
  }

  getData() {
    return {
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
    };
  }
}
