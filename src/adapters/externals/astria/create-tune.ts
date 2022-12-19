import { axiosAstria } from ".";
import { CreateTuneparams, Tune } from "./types";
import man_prompts from "../../../../resources/data/prompts/man.json";
import woman_prompts from "../../../../resources/data/prompts/woman.json";

import { Sex } from "../../../types";

const getPromptsForName = (name: Sex) => {
	if (name === "woman") return woman_prompts;
	if (name === "man") return man_prompts;
};

const getRandom = (arr: any[], n: number) => {
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

export const createTune = async ({ chatId, username, name, image_urls, promptsAmount }: CreateTuneparams) => {
	const IS_TESTING_BRANCH = process.env.IS_TESTING_BRANCH;
	const ASTRIA_CALLBACK_DOMAIN = process.env.ASTRIA_CALLBACK_DOMAIN;

	const prompts_attributes = getPromptsForName(name).map(prompt => ({
		text: prompt.text,
		callback: `${ASTRIA_CALLBACK_DOMAIN}/prompt?i=${chatId}`,
	}));

	const randomPrompts = getRandom(prompts_attributes, +promptsAmount);
	console.log("randomPrompts", { randomPrompts });

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

	const { data } = await axiosAstria.post("/tunes", { tune });
	console.log("createTune", { data });

	return data;
};
