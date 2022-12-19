import TelegramBot, { PreCheckoutQuery } from "node-telegram-bot-api";
import { UsersImagesLinks } from "../../../../types";

interface PreCheckoutQueryListener {
	bot: TelegramBot,
	query: PreCheckoutQuery,
	repository: UsersImagesLinks
}
const preCheckoutQueryListener = async ({ bot, query, repository }: PreCheckoutQueryListener) => {
	try {
		const { from } = query;
		const { id } = from;
		console.log("Pre_checkout_query=", query);

		if (!repository[id]) {
			await bot.answerPreCheckoutQuery(query.id, false, { error_message: "Этот заказ уже оплачен. Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!" });
			return;
		}
		await bot.answerPreCheckoutQuery(query.id, true);
	} catch (error) {
		console.log("Error: ", error);
		await bot.answerPreCheckoutQuery(query.id, false, { error_message: "Что-то пошло не так!" });
	}
};

export { preCheckoutQueryListener };
