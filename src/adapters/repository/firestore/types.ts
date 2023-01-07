export interface AddUserParams {
	id: number;
	username?: string;
	languageCode?: string;
	from?: string;
}

export interface AddUserPaymentParams {
	id: number;
	payment: number;
}

export interface CheckSecretParams {
	code: string;
}
