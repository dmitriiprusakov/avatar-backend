/* eslint-disable @typescript-eslint/ban-ts-comment */
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { MessagesCache } from "types";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "winston";

import { payments } from "./payments-config";

const YOOMONEY_TOKEN = process.env.YOOMONEY_TOKEN;

interface PaymentQueryParams {
	bot: TelegramBot,
	query: CallbackQuery,
	messagesCache: MessagesCache,
	logger: Logger,
}
export const paymentQueryHandler = async ({ bot, query, messagesCache, logger }: PaymentQueryParams) => {
	const { id: queryId, from, data } = query;
	const { id, username = "anonymous" } = from;

	const [queryType, queryValue] = data.split("/");

	try {
		const selectedPayment = payments[queryValue];

		if (messagesCache[id]?.choosePayOptionMessageId) {
			await bot.editMessageText(
				`Сколько аватарок рисуем?\n➪ _*${selectedPayment.text}*_`,
				{
					chat_id: id,
					message_id: messagesCache[id].choosePayOptionMessageId,
					parse_mode: "MarkdownV2",
				}
			);
			delete messagesCache[id].choosePayOptionMessageId;
			await bot.answerCallbackQuery(queryId);
		}

		setTimeout(async () => {
			// FIXME: перед высылкой инвойса нужно чекнуть, что все данные есть, пол, фотки
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
		}, 600);
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, payment C_Q from ${id} ${username}, Q_T ${queryType}, Q_V ${queryValue}, ${error}`,
		});
		await bot.answerCallbackQuery(queryId);
	}
};
