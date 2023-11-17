import {Config, starWars, uniqueNamesGenerator} from "unique-names-generator";

const config: Config = {
    dictionaries: [starWars],
};

export const generateDisplayName = () => uniqueNamesGenerator(config);