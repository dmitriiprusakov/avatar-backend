import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { FieldValue, Firestore, getFirestore } from "firebase-admin/firestore";

import serviceAccount from "../../../../service-account.json";
import { AddUserParams, CheckSecretParams, UpdateUserLastImagesParams } from "./types";

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

	private secrets() {
		return this.firestore.collection("secrets");
	}

	async AddUser({ id, username, language_code }: AddUserParams) {
		const docRef = this.users().doc(`${id}`);

		return await docRef.set({
			alias: username,
			lng: language_code,
			lastMsgTs: FieldValue.serverTimestamp(),
		}, { merge: true });
	}

	async CheckSecret({ code }: CheckSecretParams) {
		const snapshot = await this.secrets().where("code", "==", code).limit(1).get();

		if (snapshot.empty) return false;

		snapshot.forEach(async doc => {
			await this.secrets().doc(doc.id).delete();
		});

		return true;
	}

	async UpdateUserLastImages({ id, imageUrl }: UpdateUserLastImagesParams) {
		const docRef = this.users().doc(`${id}`);

		return await docRef.update({
			last_images: FieldValue.arrayUnion(imageUrl),
		});
	}
}

export default FirestoreRepository;
