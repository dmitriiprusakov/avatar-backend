import { t } from "i18next";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Logger } from "winston";

interface HelpParams {
	bot: TelegramBot,
	message: Message,
	logger: Logger,
}
export const helpHandler = async ({ bot, message, logger }: HelpParams) => {
	const { from } = message;
	const { id, username = "anonymous" } = from;

	try {
		await bot.sendMessage(id, t("help", { lng: "ru" }));

		logger.log({
			level: "info",
			message: `C /help from ${id} ${username}`,
		});
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, C /help from ${id} ${username}, ${error}`,
		});
	}
};
