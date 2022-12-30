import { Application } from "express";
import TelegramBot, { InputMedia } from "node-telegram-bot-api";
import { Logger } from "winston";

type PromptCallbackPayload = {
	id: number,
	text: string,
	negative_prompt: string,
	steps: null,
	trained_at: string,
	started_training_at: string,
	created_at: string,
	updated_at: string,
	tune_id: number,
	images: string[]
}

interface InitRoutes {
	app: Application,
	bot: TelegramBot,
	logger: Logger,
}
const initRoutes = ({ app, bot, logger }: InitRoutes) => {
	app.post("/finetune", async (req, res) => {
		try {
			const { i: chatId } = req.query;
			if (!chatId) return res.send("No expected url params provided!");

			await bot.sendMessage(chatId as string, "Почти готово!");

			res.send("OK, Thanks for finetune, Astria! Waiting for prompts...");

			logger.log("info", `T finished for ${chatId}`);
		} catch (error) {
			logger.log({
				level: "error",
				message: `Error, finishing T, ${error}`,
			});
		}
	});

	app.post("/prompt", async (req, res) => {
		try {
			const { i: chatId } = req.query;
			if (!chatId) return res.send("No expected url params provided!");

			const prompt: PromptCallbackPayload = req.body.prompt;
			const { images } = prompt;

			const media = images.map<InputMedia>((imageUrl, index) => ({
				type: "photo",
				media: imageUrl,
				caption: index === 0 ? "Один из стилей ⬆️" : undefined,
			}));

			setTimeout(async () => {
				await bot.sendMediaGroup(chatId as string, media);
			}, 5000);

			res.send("OK, Thanks for prompts, Astria! See ya!");

			logger.log("info", `P finished for ${chatId}`);
		} catch (error) {
			logger.log({
				level: "error",
				message: `Error, finishing P, ${error}`,
			});
		}
	});
};

export default initRoutes;
