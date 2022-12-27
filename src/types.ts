export type Sex = "man" | "woman";

export type Id = number;

export type UserData = {
	sex?: Sex,
	payment?: number,
	links?: string[],
}

export type Cache = Record<Id, UserData>

export type MessagesCache = Record<Id, any>

export type Payment = {
	text: string;
}

export type PaymentsConfig = Record<string, Payment>
