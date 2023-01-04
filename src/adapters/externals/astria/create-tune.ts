import { Sex } from "types";

import man_prompts from "../../../../resources/data/prompts/man.json";
import woman_prompts from "../../../../resources/data/prompts/woman.json";
import { axiosAstria } from ".";
import { CreateTuneparams, Tune } from "./types";

const newYearManPrompts = [
	{
		"text": "sks handsome man as The King of the North, digital art, ultradetailed, close up, portrait, artstation",
	},
	{
		"text": "sks amazing beautiful man in snowfall, expressive eyes, digital art, ultradetailed, close up, portrait, artstation",
	},
	{
		"text": "sks brutal handsome man from north, viking, in snowfall, portrait",
	},
	{
		"text": "sks man in santa hat and red sweater, close up, portrait",
	},
	{
		"text": "sks man as russian president on new year greetings, Kremlin on backgroud",
	},
	{
		"text": "sks man on main poster from film Home Alone, frame from film, film poster",
	},
	{
		"text": "sks man as Grinch from How the Grinch Stole Christmas, film frame",
	},
];

const newYearWomanPrompts = [
	{
		"text": "sks amazing woman as The Snow Queen, digital art, ultradetailed, close up, portrait, artstation",
	},
	{
		"text": "sks beautiful woman as Elsa of Arendelle, digital art, ultradetailed, close up, portrait, artstation",
	},
	{
		"text": "sks beautiful woman as The Snow Queen, digital art, ultradetailed, close up, portrait, artstation",
	},
	{
		"text": "sks beautiful woman as character Crystal Maiden from game Dota 2, close up, portrait, artstation",
	},
	{
		"text": "sks beautiful woman as Snow Maiden, close up, portrait",
	},
	{
		"text": "sks beautiful woman as Anna of Arendelle, disney queen, expressive eyes, digital art, ultradetailed, close up, portrait, artstation",
	},
	{
		"text": "sks beautiful woman in snowfall, expressive eyes, digital art, ultradetailed, close up, portrait, artstation",
	},
];

const getPromptsForName = (name: Sex) => {
	if (name === "woman") return woman_prompts;
	if (name === "man") return man_prompts;
	return [];
};

const getAdditionalPromptsForName = (name: Sex) => {
	if (name === "woman") return newYearWomanPrompts;
	if (name === "man") return newYearManPrompts;
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

		const randomPrompts = getRandom(promptsForName, promptsAmount)
			.concat(getAdditionalPromptsForName(name)).map(prompt => ({
				text: prompt.text,
				callback: `${ASTRIA_CALLBACK_DOMAIN}/prompt?i=${chatId}`,
			}));

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
