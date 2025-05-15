import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { ChatComponent } from "./components/chat/chat.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { routes } from "./app.routes";
import { WebSocketService } from "../services/web-socket.service";
import { BrowserModule } from "@angular/platform-browser";
import { ReactiveFormsModule } from "@angular/forms";
import { NotificationComponent } from "./components/notification/notification.component";
// import { messaging } from "../configs/firebase.config";
import { NotificationService } from "../apis/notification.service";
import { HttpClientModule } from "@angular/common/http";
import { TooltipDirective } from "./tooltip.directive";
import { RemintonComponent } from "./reminton/reminton.component";

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    NotificationComponent,
    RemintonComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    WebSocketService,
    // { provide: 'messaging', useValue: messaging},
    NotificationService,
    // TooltipDirective
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
constructor() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}
}
