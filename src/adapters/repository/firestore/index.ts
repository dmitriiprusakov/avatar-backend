import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { FieldValue, Firestore, getFirestore } from "firebase-admin/firestore";
import { Logger } from "winston";

import serviceAccount from "../../../../service-account.json";
import { AddUserParams, AddUserPaymentParams, CheckSecretParams } from "./types";

interface FirestoreRepositoryConstructor {
	logger: Logger
}

class FirestoreRepository {
	private readonly firestore: Firestore = null;
	private readonly logger: Logger = null;

	constructor({ logger }: FirestoreRepositoryConstructor) {
		const app = initializeApp({
			credential: cert(serviceAccount as ServiceAccount),
		});
		this.logger = logger;
		this.firestore = getFirestore(app);
	}

	private users() {
		return this.firestore.collection("users");
	}

	private secrets() {
		return this.firestore.collection("secrets");
	}

	AddUser({ id, username, languageCode, from }: AddUserParams) {
		try {
			const payload: any = {};

			if (username) payload.alias = username;
			if (languageCode) payload.lng = languageCode;
			if (from) payload.from = FieldValue.arrayUnion(from);

			const docRef = this.users().doc(`${id}`);

			docRef.set(payload, { merge: true });

			return;
		} catch (error) {
			this.logger.log({
				level: "info",
				message: `Repo AddUser command failed, ${error}`,
			});
		}
	}

	AddUserPayment({ id, payment }: AddUserPaymentParams) {
		try {
			const docRef = this.users().doc(`${id}`);

			docRef.set({
				payments: FieldValue.arrayUnion(payment),
			}, { merge: true });

			return;
		} catch (error) {
			this.logger.log({
				level: "info",
				message: `Repo AddUserPayment command failed, ${error}`,
			});
		}
	}

	async CheckSecret({ code }: CheckSecretParams) {
		try {
			const snapshot = await this.secrets().where("code", "==", code).limit(1).get();

			if (snapshot.empty) return false;

			snapshot.forEach(async doc => {
				await this.secrets().doc(doc.id).delete();
			});

			return true;
		} catch (error) {
			this.logger.log({
				level: "info",
				message: `Repo CheckSecret command failed, ${error}`,
			});
		}
	}
}

export default FirestoreRepository;
