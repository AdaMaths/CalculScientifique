// ============================================================
// CalculLAB — Firebase client (optionnel)
// ------------------------------------------------------------
// Ce projet fonctionne entièrement en mode statique sans backend.
// Active Firebase si tu veux : auth, données utilisateur, sauvegarde
// de résultats, stockage de fichiers, etc.
//
// 1. Ajoute dans index.html, avant js/app.js :
//    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
//    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
//    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
// 2. Renseigne les valeurs ci-dessous dans ton projet Firebase.
// 3. Ne commite JAMAIS ta clé privée ou les secrets du service account.
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

if (window.firebase && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) {
  firebaseApp = window.firebase.initializeApp(FIREBASE_CONFIG);
  firebaseAuth = window.firebase.auth();
  firebaseDb = window.firebase.firestore();

  window.firebaseApp = firebaseApp;
  window.firebaseAuth = firebaseAuth;
  window.firebaseDb = firebaseDb;

  console.info('[CalculLAB] Firebase initialisé.');
} else {
  console.info('[CalculLAB] Firebase non configuré — le site fonctionne en mode 100% statique.');
}

window.CalculLABFirebase = {
  app: firebaseApp,
  auth: firebaseAuth,
  db: firebaseDb,
  saveResult: async function (collectionName, documentId, payload) {
    if (!firebaseDb) return null;
    const ref = firebaseDb.collection(collectionName).doc(documentId);
    await ref.set(payload, { merge: true });
    return ref;
  },
  getResult: async function (collectionName, documentId) {
    if (!firebaseDb) return null;
    const snap = await firebaseDb.collection(collectionName).doc(documentId).get();
    return snap.exists ? snap.data() : null;
  }
};
