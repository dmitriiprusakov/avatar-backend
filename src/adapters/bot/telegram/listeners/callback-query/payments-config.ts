type Price = {
	amount: number;
	label: string;
}

type Payment = {
	title: string;
	description: string;
	text: string;
	payload: string;
	prices: Price[];
}

type Payments = Record<string, Payment>
export const payments: Payments = {
	"1": {
		"title": "Аватарки 80/10",
		"description": "Оплата 80 аватарок в 10 разных стилях",
		"text": "80 аватарок в 10 стилях за 239₽, скидка 20%",
		"payload": "10",
		"prices": [
			{ "amount": 29900, "label": "Цена" },
			{ "amount": -6000, "label": "Скидка 20%" },
		],
	},
	"2": {
		"title": "Аватарки 160/20",
		"description": "Оплата 160 аватарок в 20 разных стилях",
		"text": "160 аватарок в 20 стилях за 479₽, скидка 25%",
		"payload": "20",
		"prices": [
			{ "amount": 59900, "label": "Цена" },
			{ "amount": -15000, "label": "Скидка 25%" },
		],
	},
	"3": {
		"title": "Аватарки 240/30",
		"description": "Оплата 240 аватарок в 30 разных стилях",
		"text": "240 аватарок в 30 стилях за 559₽, скидка 30%",
		"payload": "30",
		"prices": [
			{ "amount": 79900, "label": "Цена" },
			{ "amount": -24000, "label": "Скидка 30%" },
		],
	},
};
