export type Sex = "man" | "woman";

export type UserData = {
	sex?: Sex,
	links?: string[],
}

export type UsersImagesLinks = Record<number, UserData>;

export type Payment = {
	text: string;
}

export type PaymentsConfig = Record<string, Payment>
