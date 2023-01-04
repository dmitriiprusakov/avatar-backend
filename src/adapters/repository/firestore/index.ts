import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { FieldValue, Firestore, getFirestore } from "firebase-admin/firestore";
import { Logger } from "winston";

import serviceAccount from "../../../../service-account.json";
import { AddUserParams, CheckSecretParams, UpdateCampaignPaymentsAmountTotalParams, UpdateCampaignUsersAmountParams } from "./types";

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

	private campaigns() {
		return this.firestore.collection("campaigns");
	}

	private secrets() {
		return this.firestore.collection("secrets");
	}

	async AddUser({ id, username, language_code }: AddUserParams) {
		try {
			const docRef = this.users().doc(`${id}`);

			return await docRef.set({
				alias: username,
				lng: language_code,
				lastMsgTs: FieldValue.serverTimestamp(),
			}, { merge: true });
		} catch (error) {
			this.logger.log({
				level: "info",
				message: `Repo AddUser command failed, ${error}`,
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

	UpdateCampaignUsersAmount({ campaignId }: UpdateCampaignUsersAmountParams) {
		try {
			console.log({ campaignId });

			const docRef = this.campaigns().doc(campaignId);

			docRef.set({
				usersAmount: FieldValue.increment(1),
			}, { merge: true });
			return;
		} catch (error) {
			this.logger.log({
				level: "info",
				message: `Repo UpdateCampaignUsersAmount command failed, ${error}`,
			});
		}
	}

	UpdateCampaignPaymentsAmountTotal({ campaignId, payment }: UpdateCampaignPaymentsAmountTotalParams) {
		try {
			console.log({ campaignId, payment });
			const docRef = this.campaigns().doc(`${campaignId}`);

			docRef.set({
				paymentsAmountTotal: FieldValue.increment(payment),
			}, { merge: true });
		} catch (error) {
			this.logger.log({
				level: "info",
				message: `Repo UpdateCampaignPaymentsAmountTotal command failed, ${error}`,
			});
		}
	}
}

export default FirestoreRepository;
