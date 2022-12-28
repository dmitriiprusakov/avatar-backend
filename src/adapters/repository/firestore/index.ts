import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { FieldValue, Firestore, getFirestore } from "firebase-admin/firestore";

import serviceAccount from "../../../../service-account.json";
import { AddUserParams, UpdateUserLastImagesParams } from "./types";

class FirestoreRepository {
	private readonly firestore: Firestore = null;
	constructor() {
		const app = initializeApp({
			credential: cert(serviceAccount as ServiceAccount),
		});

		this.firestore = getFirestore(app);
	}

	private users() {
		return this.firestore.collection("users");
	}

	private tunes() {
		return this.firestore.collection("tunes");
	}

	async AddUser({ id, username, language_code }: AddUserParams) {
		const docRef = this.users().doc(`${id}`);

		return await docRef.set({
			alias: username,
			lng: language_code,
			lastMsgTs: FieldValue.serverTimestamp(),
		}, { merge: true });
	}

	async UpdateUserLastImages({ id, imageUrl }: UpdateUserLastImagesParams) {
		const docRef = this.users().doc(`${id}`);

		return await docRef.update({
			last_images: FieldValue.arrayUnion(imageUrl),
		});
	}
}

export default FirestoreRepository;
