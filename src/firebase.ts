import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyCusHGeosMVpiw-5im5NVLZA8W2K8oo_rA',
  authDomain: 'whatsapp-clone-3d101.firebaseapp.com',
  databaseURL: 'https://whatsapp-clone-3d101.firebaseio.com',
  projectId: 'whatsapp-clone-3d101',
  storageBucket: 'whatsapp-clone-3d101.appspot.com',
  messagingSenderId: '62586421436',
  appId: '1:62586421436:web:aeed9649021131d19910b9',
  measurementId: 'G-49316GG2Z3'
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { auth, provider };
export default db;
