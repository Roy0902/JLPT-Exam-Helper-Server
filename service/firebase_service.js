import { initializeApp, applicationDefault } from 'firebase-admin/app';
import admin from 'firebase-admin'
import { getMessaging } from 'firebase-admin/messaging';
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };

// Initialize Firebase Admin SDK

let firebaseApp;
try {
    firebaseApp = initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}catch (error){
    console.log(error)
}

class firebase_service {

    async sendNotificationToUser(firebase_token) {
              
        const message = {
            notification: {
              title: 'Study Plan Ready',
              body: 'Your Study Plan is ready!',
            },
            token: firebase_token,
        };

            
        try{
            const response = await getMessaging().send(message);
            console.log('Notification sent:', response);
        } catch (error) {
            console.log(error)
            process.exit(1); 
        }
    }
}
    
export default new firebase_service();