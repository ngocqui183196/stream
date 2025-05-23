// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from "./app/app.module";

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));

platformBrowser()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
