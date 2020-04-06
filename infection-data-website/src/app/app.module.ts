import { BrowserModule, EventManager } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MDBBootstrapModule, DatepickerModule, WavesModule, MDBDatePickerComponent } from 'ng-uikit-pro-standard'

import { AppComponent } from './app.component';
import { NavMenuComponent } from './shared/components/nav-menu/nav-menu.component';

import { HomeComponent } from './shared/components/home/home.component';
import { DaysToDoubleComponent } from './shared/components/days-to-double/days-to-double.component';
import { PctChangeComponent } from './shared/components/pct-change/pct-change.component';
import { RateOfChangeComponent } from './shared/components/rate-of-change/rate-of-change.component';
import { RawDataComponent } from './shared/components/raw-data/raw-data.component';

import { SelectorComponent } from './shared/components/selector/selector.component';
import { AboutComponent } from './shared/components/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    DaysToDoubleComponent,
    PctChangeComponent,
    RateOfChangeComponent,
    RawDataComponent,
    SelectorComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    DatepickerModule, 
    WavesModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'days-to-double', component: DaysToDoubleComponent },
      { path: 'pct-change', component: PctChangeComponent },
      { path: 'rate-of-change', component: RateOfChangeComponent },
      { path: 'raw-data', component: RawDataComponent },
      { path: 'about', component: AboutComponent },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
