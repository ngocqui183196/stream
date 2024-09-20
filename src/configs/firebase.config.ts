import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';
import { environment } from "../environments/environment.prod";

firebase.initializeApp(environment.firebaseConfig);
console.log("Có đi vào file firebase.config này nywxa này không");
export const messaging = firebase.messaging();

