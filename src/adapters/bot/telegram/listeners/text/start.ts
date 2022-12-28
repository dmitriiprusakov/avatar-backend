import { FirestoreRepository } from "adapters/repository";
import { t } from "i18next";
import { logger } from "logger";
import TelegramBot, { InputMedia, Message } from "node-telegram-bot-api";

const startMediaGroup = [
	"https://www.dropbox.com/s/docz6jphy7dki10/examples_gallery.png?dl=0",
	"https://www.dropbox.com/s/dd4qgvvcz11y8m4/recommended.png?dl=0",
	"https://www.dropbox.com/s/56zzg8b70yrx2ra/not_recommended.png?dl=0",
].map<InputMedia>((imageUrl, index) => ({
	type: "photo",
	media: imageUrl,
	caption: index === 0 ? t("welcome", { lng: "ru" }) : undefined,
}));

interface StartParams {
	bot: TelegramBot,
	message: Message,
	repository: FirestoreRepository,
}
export const startHandler = async ({ bot, repository, message }: StartParams) => {
	const { from } = message;
	const { id, username = "anonymous", language_code } = from;

	try {
		await bot.sendMediaGroup(id, startMediaGroup);

		await repository.AddUser({ id, username, language_code });

		logger.log({
			level: "info",
			message: `C /start from ${id} ${username}`,
		});
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, C /start from ${id} ${username}, ${error}`,
		});
	}
};
