/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ExternalServices } from "adapters/externals";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "winston";

import { payments } from "./payments-config";

const YOOMONEY_TOKEN = process.env.YOOMONEY_TOKEN;

interface PaymentQueryParams {
	bot: TelegramBot,
	query: CallbackQuery,
	cache: Cache;
	messagesCache: MessagesCache,
	logger: Logger,
	externals: ExternalServices
}
export const paymentQueryHandler = async ({ bot, query, cache, messagesCache, logger, externals }: PaymentQueryParams) => {
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

		if (cache[id]?.free) {
			if (cache[id]?.links?.length && cache[id]?.sex) {
				await bot.sendMessage(id, "🚀 Фото отправляются на обработку...");

				await externals.astria.createTune({
					chatId: id,
					image_urls: cache[id].links,
					name: cache[id].sex,
					username,
					promptsAmount: selectedPayment.payload.promptsAmount,
					logger,
				});

				await bot.sendMessage(id, "✨ Фото отправлены на обработку, примерное время ожидания 1 час!");
				delete cache[id];
			} else {
				await bot.sendMessage(id, "😿 Что-то пошло не так, пожалуйста, используйте команду /clear и повторите попытку!");
				delete cache[id];
			}

			return;
		}

		if (cache[id]?.links?.length && cache[id]?.sex) {
			await bot.sendInvoice(
				id,
				selectedPayment.title,
				selectedPayment.description,
				JSON.stringify(selectedPayment.payload),
				YOOMONEY_TOKEN,
				"RUB",
				// @ts-ignore
				selectedPayment.prices,
				{
					start_parameter: uuidv4(),
					max_tip_amount: 10000,
					suggested_tip_amounts: JSON.stringify([1200, 2500, 5000]),
				}
			);
		} else {
			delete cache[id];
			await bot.sendMessage(id, "😿 Что-то пошло не так, пожалуйста, используйте команду /clear и повторите попытку!");
		}
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, payment C_Q from ${id} ${username}, Q_T ${queryType}, Q_V ${queryValue}, ${error}`,
		});
		await bot.answerCallbackQuery(queryId);
	}
};
