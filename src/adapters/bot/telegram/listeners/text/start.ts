import { FirestoreRepository } from "adapters/repository";
import { t } from "i18next";
import TelegramBot, { InputMedia, Message } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

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
	bot: TelegramBot;
	message: Message;
	cache: Cache;
	repository: FirestoreRepository;
	logger: Logger;
}
export const startHandler = async ({ bot, cache, repository, message, logger }: StartParams) => {
	const { from, text } = message;
	const { id, username = "anonymous", language_code } = from;

	try {
		const commandPayload = text?.replace("/start ", "");

		if (commandPayload.length) {
			const url = Buffer.from(commandPayload, "base64").toString();
			const params = Object.fromEntries(new URLSearchParams(url).entries());

			if (params?.f) {
				cache[id] = Object.assign(cache[id] || {}, {
					from: params?.f,
				});
				repository.UpdateCampaignUsersAmount({ campaignId: params?.f });
			}
		}

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
