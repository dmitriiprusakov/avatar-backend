import { axiosAstria } from "../../libs/axios";
import { Tune } from "./types";
import man_prompts from "../../resources/sks_man.json";
import woman_prompts from "../../resources/sks_woman.json";

const getPromptsForName = (name: Sex) => {
	if (name === "woman") return woman_prompts;
	if (name === "man") return man_prompts;
};

type Sex = "man" | "woman";

export const createTune = async (chatId: number, image_urls: string[], name: Sex, username: string) => {
	const IS_TESTING_BRANCH = process.env.IS_TESTING_BRANCH;
	const ASTRIA_CALLBACK_DOMAIN = process.env.ASTRIA_CALLBACK_DOMAIN;
	console.log({ ASTRIA_CALLBACK_DOMAIN, IS_TESTING_BRANCH });

	const namedPrompts = getPromptsForName(name);

	const prompts_attributes = namedPrompts.map(prompt => ({
		text: prompt.text,
		callback: `${ASTRIA_CALLBACK_DOMAIN}/prompt?i=${chatId}`,
	}));

	const tune: Tune = {
		title: username,
		name,
		callback: `${ASTRIA_CALLBACK_DOMAIN}/finetune?i=${chatId}`,
		image_urls,
		prompts_attributes,
	};

	if (IS_TESTING_BRANCH) {
		tune.branch = "fast";
	}

	const { data } = await axiosAstria.post("/tunes", { tune });

	return data;
};
