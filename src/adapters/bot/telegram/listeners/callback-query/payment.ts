/* eslint-disable @typescript-eslint/ban-ts-comment */
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { logger } from "../../../../../logger";
import { payments } from "./payments-config";
import { v4 as uuidv4 } from "uuid";

const YOOMONEY_TOKEN = process.env.YOOMONEY_TOKEN;

interface PaymentQueryParams {
	bot: TelegramBot,
	query: CallbackQuery,
}
export const paymentQueryHandler = async ({ bot, query }: PaymentQueryParams) => {
	const { id: queryId, from, data } = query;
	const { id, username = "anonymous" } = from;

	const [queryType, queryValue] = data.split("/");

	// FIXME: перед высылкой инвойса нужно чекнуть, что все данные есть, пол, фотки
	try {
		const selectedPayment = payments[queryValue];
		// @ts-ignore
		await bot.sendInvoice(
			id,
			selectedPayment.title,
			selectedPayment.description,
			selectedPayment.payload,
			YOOMONEY_TOKEN,
			"RUB",
			// @ts-ignore
			selectedPayment.prices,
			{
				start_parameter: uuidv4(),
			}
		);

		await bot.answerCallbackQuery(queryId);
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, payment C_Q from ${id} ${username}, Q_T ${queryType}, Q_V ${queryValue}, ${error}`,
		});
		await bot.answerCallbackQuery(queryId);
	}
}; 
