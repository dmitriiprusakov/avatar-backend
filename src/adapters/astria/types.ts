
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
