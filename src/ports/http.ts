import { Application } from "express";
import TelegramBot, { InputMedia } from "node-telegram-bot-api";

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

const initRoutes = (app: Application, bot: TelegramBot) => {
	app.post("/finetune", async (req, res) => {
		try {
			const { i: chatId } = req.query;
			if (!chatId) return res.send("No expected url params provided!");
			console.log("Finetune-done", req.body);

			await bot.sendMessage(chatId as string, "Почти готово!");

			res.send("OK, Thanks for finetune, Astria! Waiting for prompts...");
		} catch (error) {
			console.log("Error in finetune callback: ", error);
		}
	});

	app.post("/prompt", async (req, res) => {
		try {
			const { i: chatId } = req.query;
			if (!chatId) return res.send("No expected url params provided!");

			console.log("Prompt-done", req.body);

			const prompt: PromptCallbackPayload = req.body.prompt;
			const { images } = prompt;

			const media = images.map<InputMedia>((imageUrl, index) => ({
				type: "photo",
				media: imageUrl,
				caption: index === 0 ? "Один из стилей:" : undefined,
			}));

			await bot.sendMediaGroup(chatId as string, media);

			res.send("OK, Thanks for prompts, Astria! See ya!");
		} catch (error) {
			console.log("Error in prompt callback: ", error);
		}
	});
};

export default initRoutes;
