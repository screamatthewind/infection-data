import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InfectionData } from '../../shared/models/infection-data.model';
import { Chart } from '../../shared/models/chart.model';

import { SelectionModel } from '../../shared/models/selection.model';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-dailies',
  templateUrl: './dailies.component.html'
})
export class DailiesComponent implements OnInit {

  regionSelectionChanged(selection: any) {
    this.loadData(selection);
  }

  // https://www.npr.org/sections/health-shots/2020/04/07/825479416/new-yorks-coronavirus-deaths-may-level-off-soon-when-might-your-state-s-peak

  public chartType: string = 'line';
  public chartDatasets: Array<Chart> = [];
  public chartLabels: Array<any> = [];

  public chartColors: Array<any> = [
    {
      borderColor: 'rgba(54, 162, 235, .7)',
      borderWidth: 2,
      fill: false
    },
    {
      borderColor: 'rgba(75, 192, 0, .7)',
      borderWidth: 2,
      fill: false
    },
    {
      borderColor: 'rgba(153, 102, 255, .7)',
      borderWidth: 2,
      fill: false
    },
    {
      borderColor: 'rgba(255, 159, 64, .7)',
      borderWidth: 2,
      fill: false
    },
  ];

  public chartOptions: any = {
    responsive: true
  };

  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

  baseUrl: string;
  http: HttpClient;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private sharedService: SharedService) {

    this.baseUrl = baseUrl;
    this.http = http;

    let storedRegion = localStorage.getItem('region');
    let selection = new SelectionModel();

    if (storedRegion == null)
      selection.region = 'all';
    else
      selection.region = storedRegion;

    if (sessionStorage.getItem('startDate') != null)
      selection.startDate = sessionStorage.getItem('startDate');

    if (sessionStorage.getItem('endDate') != null)
      selection.endDate = sessionStorage.getItem('endDate');

    this.sharedService.nextMessage(selection);

    this.loadData(selection);
  }

  message: SelectionModel;

  ngOnInit() {
    this.sharedService.sharedMessage.subscribe(message => this.message = message)
  }

  infections: InfectionData[];

  loadData(selection: SelectionModel) {

    this.http.get<InfectionData[]>(this.baseUrl + 'InfectionData?region=' + selection.region + '&pStartDate=' + selection.startDate + '&pEndDate=' + selection.endDate).subscribe(result => {

      this.infections = result;

      let objAggregatedConfirmedDelta = new Chart();
      let objActiveConfirmedDelta = new Chart();
      let objRecoveredDelta = new Chart();
      let objDeathsDelta = new Chart();

      let objAggregatedConfirmedDeltaMovingAverage = new Chart();
      let objActiveConfirmedDeltaMovingAverage = new Chart();
      let objRecoveredDeltaMovingAverage = new Chart();
      let objDeathsDeltaMovingAverage = new Chart();

      objAggregatedConfirmedDelta.label = 'Aggregate Confirmed';
      objActiveConfirmedDelta.label = 'Active Confirmed';
      objRecoveredDelta.label = 'Recovered';
      objDeathsDelta.label = 'Deaths';

      objAggregatedConfirmedDeltaMovingAverage.label = 'Aggregate Confirmed';
      objActiveConfirmedDeltaMovingAverage.label = 'Active Confirmed';
      objRecoveredDeltaMovingAverage.label = 'Recovered';
      objDeathsDeltaMovingAverage.label = 'Deaths';

      this.chartDatasets = new Array<Chart>();
      this.chartLabels = new Array<Chart>();

      for (let infection of this.infections) {

        this.chartLabels.push(infection.date);

        objAggregatedConfirmedDelta.data.push(infection.aggregatedConfirmedDelta);
        objActiveConfirmedDelta.data.push(infection.activeConfirmedDelta);
        objRecoveredDelta.data.push(infection.recoveredDelta);
        objDeathsDelta.data.push(infection.deathsDelta);

        if (infection.aggregatedConfirmedDaysToDouble)
          objAggregatedConfirmedDelta.pointRadius.push(6);
        else
          objAggregatedConfirmedDelta.pointRadius.push(3);

        if (infection.activeConfirmedDaysToDouble)
          objActiveConfirmedDelta.pointRadius.push(6);
        else
          objActiveConfirmedDelta.pointRadius.push(3);

        if (infection.recoveredDaysToDouble)
          objRecoveredDelta.pointRadius.push(6);
        else
          objRecoveredDelta.pointRadius.push(3);

        if (infection.deathsDaysToDouble)
          objDeathsDelta.pointRadius.push(6);
        else
          objDeathsDelta.pointRadius.push(3);
      }

      this.calculateMovingAverage(objAggregatedConfirmedDelta, objAggregatedConfirmedDeltaMovingAverage);
      this.calculateMovingAverage(objActiveConfirmedDelta, objActiveConfirmedDeltaMovingAverage);
      this.calculateMovingAverage(objRecoveredDelta, objRecoveredDeltaMovingAverage);
      this.calculateMovingAverage(objDeathsDelta, objDeathsDeltaMovingAverage);

      // this.chartDatasets.push(objAggregatedConfirmedDelta);
      // this.chartDatasets.push(objActiveConfirmedDelta);
      // this.chartDatasets.push(objRecoveredDelta);
      // this.chartDatasets.push(objDeathsDelta);

      this.chartDatasets.push(objAggregatedConfirmedDeltaMovingAverage);
      this.chartDatasets.push(objActiveConfirmedDeltaMovingAverage);
      this.chartDatasets.push(objRecoveredDeltaMovingAverage);
      this.chartDatasets.push(objDeathsDeltaMovingAverage);

    }, error => console.error(error));
  }

  calculateMovingAverage(source: Chart, dest: Chart) {

    for (var o = 0; o < source.data.length + 3; o++) {

      var sum = 0;
      var numValues = 0;
      var index = 0;

      for (var i = 0; i < 7; i++)
      {
        index = (o + i) - 3;
      
        if ((index => 0) && (index < source.data.length))
        {
          sum += source.data[index];
          numValues++;
        }
      }

      dest.data.push(sum / numValues);
    }
  }
}
