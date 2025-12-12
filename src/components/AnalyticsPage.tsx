import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { BarChart3 } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Statistics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="flex-1 flex items-center justify-center text-gray-300 flex-col h-full">
          <BarChart3 className="w-20 h-20 mb-6 opacity-20" />
          <p className="font-bold">Analytics Coming Soon</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AnalyticsPage;
