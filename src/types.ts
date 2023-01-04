export type Sex = "man" | "woman";

export type TelegramId = number;

export type UserData = {
	sex?: Sex,
	payment?: number,
	links?: string[],
	free?: boolean,
	from?: string,
}

export type Cache = Record<TelegramId, UserData>

export type UserMessagesCache = {
	imagesCountMessageId?: TelegramId[];
	choosePayOptionMessageId?: TelegramId;
	chooseSexMessageId?: TelegramId;
}

export type MessagesCache = Record<TelegramId, UserMessagesCache>

export type Payment = {
	text: string,
}

export type PaymentsConfig = Record<string, Payment>
