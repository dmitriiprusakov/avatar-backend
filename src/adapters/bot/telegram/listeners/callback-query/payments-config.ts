type Price = {
	amount: number;
	label: string;
}

export type Payload = {
	promptsAmount: number;
	payment: number;
}

type Payment = {
	title: string;
	description: string;
	text: string;
	payload: Payload;
	prices: Price[];
}

type Payments = Record<string, Payment>
export const payments: Payments = {
	"1": {
		"title": "Аватарки 80",
		"description": "Оплата 80 аватарок",
		"text": "80 аватарок за 299₽",
		"payload": { promptsAmount: 10, payment: 29900 },
		"prices": [
			{ "amount": 29900, "label": "Цена" },
		],
	},
	"2": {
		"title": "Аватарки 160",
		"description": "Оплата 160 аватарок",
		"text": "160 аватарок за 499₽, выгода 20%",
		"payload": { promptsAmount: 20, payment: 49900 },
		"prices": [
			{ "amount": 49900, "label": "Цена" },
		],
	},
	"3": {
		"title": "Аватарки 240",
		"description": "Оплата 240 аватарок",
		"text": "240 аватарок за 599₽, выгода 30%",
		"payload": { promptsAmount: 30, payment: 59900 },
		"prices": [
			{ "amount": 59900, "label": "Цена" },
		],
	},
};
