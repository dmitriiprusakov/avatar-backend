import { Sex } from "types";

import man_prompts from "../../../../resources/data/prompts/man.json";
import woman_prompts from "../../../../resources/data/prompts/woman.json";
import { axiosAstria } from ".";
import { CreateTuneparams, Tune } from "./types";

const getPromptsForName = (name: Sex) => {
	if (name === "female") return woman_prompts;
	if (name === "male") return man_prompts;
	return [];
};

const getRandom = (arr: unknown[], n: number) => {
	const result = new Array(n);
	let len = arr.length;
	const taken = new Array(len);

	if (n > len) throw new RangeError("getRandom: more elements taken than available");

	while (n--) {
		const x = Math.floor(Math.random() * len);

		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
};

export const createTune = async ({ logger, chatId, username = "anonymous", name, image_urls, promptsAmount }: CreateTuneparams) => {
	try {
		const IS_TESTING_BRANCH = process.env.IS_TESTING_BRANCH;
		const ASTRIA_CALLBACK_DOMAIN = process.env.ASTRIA_CALLBACK_DOMAIN;

		const promptsForName = getPromptsForName(name).map(prompt => ({
			text: prompt.text,
			callback: `${ASTRIA_CALLBACK_DOMAIN}/prompt?i=${chatId}`,
		}));

		const randomPrompts = getRandom(promptsForName, +promptsAmount);

		const tune: Tune = {
			title: username,
			name,
			callback: `${ASTRIA_CALLBACK_DOMAIN}/finetune?i=${chatId}`,
			image_urls,
			prompts_attributes: randomPrompts,
		};

		if (IS_TESTING_BRANCH) {
			tune.branch = "fast";
		}

		await axiosAstria.post("/tunes", { tune });

		logger.log("info", `T to A for ${chatId}, params: ${username}, ${name}`);
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, T for ${chatId} ${username}, ${error}`,
		});
	}
};
