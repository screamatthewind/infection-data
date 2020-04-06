import { Component, Input, Inject } from '@angular/core';
import { InfectionData } from '../../models/infection-data.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
})

export class RawDataComponent {

  regionSelectionChanged(region: any) {
    console.log('selected region: ' + region);
    this.loadData(region);
  }

  baseUrl: string;
  http: HttpClient;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {

    this.baseUrl = baseUrl;
    this.http = http;

    let storedRegion = localStorage.getItem('region');

    if (storedRegion == null)
      this.loadData('all');
    else
      this.loadData(storedRegion);
  }

  public infections: InfectionData[];

  loadData(region: string) {
    this.http.get<InfectionData[]>(this.baseUrl + 'InfectionData?region=' + region).subscribe(result => {

      this.infections = result;
      
    }, error => console.error(error));

  }
}