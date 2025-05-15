import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { ChatComponent } from "./components/chat/chat.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { routes } from "./app.routes";
import { WebSocketService } from "../services/web-socket.service";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NotificationComponent } from "./components/notification/notification.component";
import { messaging } from "../configs/firebase.config";
import { NotificationService } from "../apis/notification.service";
import { HttpClientModule } from "@angular/common/http";
import { RemintonComponent } from "./components/reminton/reminton.component";
import { HomeComponent } from "./components/change-detection/home/home.component";
import { BComComponent } from "./components/change-detection/b-com/b-com.component";
import { CComComponent } from "./components/change-detection/c-com/c-com.component";
import { AComComponent } from "./components/change-detection/a-com/a-com.component";
import { DComComponent } from "./components/change-detection/d-com/d-com.component";
import { AngularFireModule } from "@angular/fire/compat";
import { environment } from "../environments/environment.prod";
import { AngularFireMessagingModule } from "@angular/fire/compat/messaging";
import { MediaComponent } from "./components/video-display/media.component";

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    NotificationComponent,
    RemintonComponent,
    HomeComponent,
    AComComponent,
    BComComponent,
    CComComponent,
    DComComponent,
    MediaComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Cấu hình Firebase
    AngularFireMessagingModule, // Thêm AngularFireMessagingModule
  ],
  providers: [
    WebSocketService,
    { provide: 'messaging', useValue: messaging},
    NotificationService,
    // TooltipDirective
    {provide: 'CPU_SPEED' , useValue: '3.5 GHz'}
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
