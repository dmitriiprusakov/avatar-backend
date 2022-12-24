import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "../../../../service-account.json";

const initFirestoreRepository = async () => {
	const app = initializeApp({
		credential: cert(serviceAccount as ServiceAccount),
	});

	const firestoreDb = getFirestore(app);

	const docRef = firestoreDb.collection("users").doc("alovelace");

	await docRef.set({
		first: "Ada1231313123",
		last: "Lovelace",
		born: 1815,
	});

	return firestoreDb;
};

export default initFirestoreRepository;
