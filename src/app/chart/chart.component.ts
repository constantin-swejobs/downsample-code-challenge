import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() timeseriesData: [number, number][] = [];
  @Input() downsample: boolean = false;

  constructor() {}

  chartInitialized(chart: Highcharts.Chart): void {
    const data: [number, number][] = !this.downsample
      ? this.timeseriesData
      : this.returnDownsampledData();

    chart.series[0].setData(data);
  }

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'datetime', // Use datetime type for time series
      labels: {
        enabled: false, // Disable x-axis labels
      },
    },
    yAxis: {
      title: {
        text: null, // Remove y-axis title
      },
    },
    legend: {
      enabled: false, // Disable the legend
    },
    series: [
      {
        type: 'line',
        lineWidth: 1,
      },
    ],
    plotOptions: {
      series: {
        states: {
          hover: {
            lineWidthPlus: 0, // Prevent line from growing bold on hover
          },
        },
      },
    },
    credits: {
      enabled: false,
    },
  };

  /** Modify and extend the code where indicated. You're also allowed to add utility functions below.*/
  private returnDownsampledData(): [number, number][] {
    console.time('returnDownsampledData');
    const dataToDownsample: [number, number][] = [...this.timeseriesData];
    const plotWidth: number = 548;

    // <-- Modify start
    const downsampledData: [number, number][] = this.LTTBDownsampling(dataToDownsample, 1000);
    // --> Modify end

    console.timeEnd('returnDownsampledData');
    console.log(
      `Input ${this.timeseriesData.length}, Output ${downsampledData.length}`
    );
    return downsampledData;
  }


  // Largest Triangle Three Buckets (downsampling time series data optimized for visualizations)
  // Ref: Algorithm described in Section 4.2, "Downsampling Time Series for Visual Representation" by Sveinn Steinarsson
  // alongside comparisons with other similar algorithms
  // https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf
  private LTTBDownsampling(input: Array<[number, number]>, outputSamplesCount: number): Array<[number, number]> {
    // 1: Split the data into equal number of buckets as the threshold but have the first
    // bucket only containing the first data point and the last bucket containing only
    // the last data point
    // 2: Select the point in the first bucket
    // 3: for each bucket except the first and last do
    // 4:   Rank every point in the bucket by calculating the area of a triangle it forms
    //      with the selected point in the last bucket and the average point in the next
    //      bucket
    // 5:   Select the point with the highest rank within the bucket
    // 6: end for
    // 7: Select the point in the last bucket

    const buckets: Array<Array<[number, number]>> = [
      [input[0]],
      ...this.balancedSplitIntoBuckets(input.slice(1, input.length - 1), outputSamplesCount - 2),
      [input[input.length - 1]]
    ];

    let outputData: Array<[number, number]> = [
      buckets[0][0],
    ];

    for (let i = 1; i < buckets.length - 1; i++) {
      const a = outputData[i - 1];
      const c = this.calculateBucketAverage(buckets[i + 1]);

      const currentBucketPoints = buckets[i];
      const bucketSampleCandidate = {
        rank: this.calculateTriangleArea(a, currentBucketPoints[0], c),
        point: currentBucketPoints[0]
      };
      for (let j = 1; j < currentBucketPoints.length - 1; j++) {
        const currentRank = this.calculateTriangleArea(a, currentBucketPoints[j], c);
        if (currentRank > bucketSampleCandidate.rank) {
          bucketSampleCandidate.rank = currentRank;
          bucketSampleCandidate.point = currentBucketPoints[j];
        }
      }
      outputData[i] = bucketSampleCandidate.point;
    }

    return [
      ...outputData,
      buckets[buckets.length - 1][0]
    ];
  }

  private balancedSplitIntoBuckets(input: Array<[number, number]>, outputBucketsCount: number): Array<Array<[number, number]>> {
    const result: Array<Array<[number, number]>> = [];
    let i = 0;

    if (input.length % outputBucketsCount == 0) {
      const bucketSize = input.length / outputBucketsCount;
      while (i < input.length) {
        result.push(input.slice(i, i += bucketSize));
      }
      return result;
    }

    while (i < input.length) {
      const currentBucketSize = Math.ceil((input.length - i) / outputBucketsCount--);
      result.push(input.slice(i, i += currentBucketSize));
    }

    return result;
  }

  private calculateTriangleArea(a: [number, number], b: [number, number], c: [number, number]): number {
    const x = (a[0]*(b[1] - c[1]) + b[0]*(c[1] - a[1]) + c[0] * (a[1] - b[1])) / 2;
    return Math.abs(x);
  }

  private calculateBucketAverage(bucketPoints: Array<[number, number]>): [number, number] {
    let average = [0, 0];
    for (let i = 0; i < bucketPoints.length; ++i) {
      average[0] = average[0] + bucketPoints[i][0];
      average[1] = average[1] + bucketPoints[i][1];
    }

    return [
      average[0] / bucketPoints.length,
      average[1] / bucketPoints.length
    ];
  }
}
