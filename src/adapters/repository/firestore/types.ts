export interface SetUserParams {
	id: number;
	username?: string;
	languageCode?: string;
	from?: string;
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
