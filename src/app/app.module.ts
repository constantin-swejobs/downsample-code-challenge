import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartComponent } from './chart/chart.component';

@NgModule({
  declarations: [AppComponent, ChartComponent],
  imports: [BrowserModule, HighchartsChartModule],
  exports: [HighchartsChartModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
