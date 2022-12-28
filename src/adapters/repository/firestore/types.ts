export interface AddUserParams {
	id: number | string;
	username?: string;
	language_code?: string;
}

export interface CheckSecretParams {
	code: string;
}

export interface UpdateUserLastImagesParams {
	id: number | string;
	imageUrl: string;
}

export interface AddImageToTuneParams {
	imageUrl: string;
}
