export interface AddUserParams {
	id: number | string;
	username?: string;
	language_code?: string;
}

export interface CheckSecretParams {
	code: string;
}

export interface UpdateCampaignUsersAmountParams {
	campaignId: string;
}

export interface UpdateCampaignPaymentsAmountTotalParams {
	campaignId: string;
	payment: number;
}
