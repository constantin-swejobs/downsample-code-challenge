import { Component } from '@angular/core';
import { Mock } from './chart/mockdata';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  mockdata: [number, number][] = Mock.Data;
}
