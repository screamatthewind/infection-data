import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { MDBBootstrapModule, DatepickerModule, WavesModule } from 'ng-uikit-pro-standard'

import { AppComponent } from './app.component';
import { NavMenuComponent } from './shared/components/nav-menu/nav-menu.component';

import { HomeComponent } from './screens/home/home.component';
import { DaysToDoubleComponent } from './screens/days-to-double/days-to-double.component';
import { PctChangeComponent } from './screens/pct-change/pct-change.component';
import { RateOfChangeComponent } from './screens/rate-of-change/rate-of-change.component';
import { DailiesComponent } from './screens/dailies/dailies.component';
import { RawDataComponent } from './screens/raw-data/raw-data.component';

import { SelectorComponent } from './shared/components/selector/selector.component';
import { AboutComponent } from './screens/about/about.component';
import { SharedService } from './shared/services/shared.service';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    DaysToDoubleComponent,
    PctChangeComponent,
    RateOfChangeComponent,
    DailiesComponent,
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
      { path: 'dailies', component: DailiesComponent },
      { path: 'days-to-double', component: DaysToDoubleComponent },
      { path: 'pct-change', component: PctChangeComponent },
      { path: 'rate-of-change', component: RateOfChangeComponent },
      { path: 'raw-data', component: RawDataComponent },
      { path: 'about', component: AboutComponent },
    ])
  ],
  providers: [DatePipe, SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
