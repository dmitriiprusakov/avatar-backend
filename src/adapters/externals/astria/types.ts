import { Sex } from "../../../types";

export interface Astria {
    createTune: ({ chatId, username, name, image_urls, promptsAmount }: CreateTuneparams) => Promise<any>
}

export interface CreateTuneparams {
    chatId: number,
    username: string
    name: Sex,
    image_urls: string[],
    promptsAmount: string
}

export type Prompt = {
    text: string;
    negative_prompt?: string;
    super_resolution?: boolean;
    face_correct?: true;
}

export type Tune = {
    title: string,
    branch?: string,
    name: string,
    callback: string,
    image_urls: string[],
    prompts_attributes?: Prompt[],
}
