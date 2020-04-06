import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
})

export class SelectorComponent {

    @Output() regionSelectedEvent: EventEmitter<any> = new EventEmitter<any>();

    region: string;
    regions: Array<any> = [];
    baseUrl: string;
    http: HttpClient;

    constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {

        this.baseUrl = baseUrl;
        this.http = http;
        this.region = 'all';
    }

    // https://mdbootstrap.com/docs/angular/forms/inputs/

    ngOnInit()
    {
        this.http.get<string[]>(this.baseUrl + 'Regions').subscribe(results => {

            for (let result of results) 
                this.regions.push(result);

        }, error => console.error(error));

        let storedRegion = localStorage.getItem('region');
        if (storedRegion != null)
            this.region = storedRegion;
    }

    handleRegionSelection($event: any) {

        localStorage.setItem('region', $event.target.text)

        this.region = $event.target.text;
        this.regionSelectedEvent.emit(`${$event.target.text}`);
        return false;
    }
}