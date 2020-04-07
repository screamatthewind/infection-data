import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InfectionData } from '../../models/infection-data.model';
import { Chart } from '../../models/chart.model';
import { SelectionModel } from '../../models/selection.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  regionSelectionChanged(selection: any) {
    this.loadData(selection);
  }

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
      borderColor: 'rgba(75, 192, 192, .7)',
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
    }
  ];

  public chartOptions: any = {
    responsive: true
  };

  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

  baseUrl: string;
  http: HttpClient;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {

    this.baseUrl = baseUrl;
    this.http = http;

    let storedRegion = localStorage.getItem('region');
    let selection = new SelectionModel();

    if (storedRegion == null)
      selection.region = 'all';
    else
      selection.region = storedRegion;

    this.loadData(selection);
  }

  infections: InfectionData[];

  loadData(selection: SelectionModel) {

    this.http.get<InfectionData[]>(this.baseUrl + 'InfectionData?region=' + selection.region + '&pStartDate=' + selection.startDate + '&pEndDate=' + selection.endDate).subscribe(result => {

      this.infections = result;

      let objAggregatedConfirmed = new Chart();
      let objActiveConfirmed = new Chart();
      let objRecovered = new Chart();
      let objDeaths = new Chart();

      objAggregatedConfirmed.label = 'Aggregate Confirmed';
      objActiveConfirmed.label = 'Active Confirmed';
      objRecovered.label = 'Recovered';
      objDeaths.label = 'Deaths';

      this.chartDatasets = new Array<Chart>();
      this.chartLabels = new Array<Chart>();
    
      for (let infection of this.infections) {

        this.chartLabels.push(infection.date);

        objAggregatedConfirmed.data.push(infection.aggregatedConfirmed);
        objActiveConfirmed.data.push(infection.activeConfirmed);
        objRecovered.data.push(infection.recovered);
        objDeaths.data.push(infection.deaths);

        if (infection.aggregatedConfirmedDaysToDouble)
          objAggregatedConfirmed.pointRadius.push(6);
        else
          objAggregatedConfirmed.pointRadius.push(3);

        if (infection.activeConfirmedDaysToDouble)
          objActiveConfirmed.pointRadius.push(6);
        else
          objActiveConfirmed.pointRadius.push(3);

        if (infection.recoveredDaysToDouble)
          objRecovered.pointRadius.push(6);
        else
          objRecovered.pointRadius.push(3);

        if (infection.deathsDaysToDouble)
          objDeaths.pointRadius.push(6);
        else
          objDeaths.pointRadius.push(3);
      }

      this.chartDatasets.push(objAggregatedConfirmed);
      this.chartDatasets.push(objActiveConfirmed);
      this.chartDatasets.push(objRecovered);
      this.chartDatasets.push(objDeaths);

    }, error => console.error(error));

  }
}
