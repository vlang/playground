import { CodeRepository } from "./interface";
import { SharedCodeRepository } from "./SharedCodeRepository";
import { TextCodeRepository } from "./TextCodeRepository";
import { LocalCodeRepository } from "./LocalCodeRepository";

import { QueryParams } from "../QueryParams";
import { PlaygroundConfig } from "../PlaygroundConfig";

/**
 * CodeRepositoryManager is responsible for managing the code repositories.
 */
export class CodeRepositoryManager {

    /**
     * Base on `params` tries to select the appropriate repository to get the code.
     *
     * @param params The query parameters.
     * @param config The playground configuration.
     * @returns {CodeRepository}
     */
    static selectRepository(params: QueryParams, config?: PlaygroundConfig): CodeRepository {
        if (config !== undefined && config.codeHash !== null && config.codeHash !== undefined) {
            return new SharedCodeRepository(config.codeHash)
        }

        if (config !== undefined && config.code !== null && config.code !== undefined) {
            return new TextCodeRepository(config.code)
        }

        if (config !== undefined && config.embed !== null && config.embed !== undefined && config.embed) {
            // By default, editor is empty for embed mode.
            return new TextCodeRepository("")
        }

        const repository = new LocalCodeRepository()
        const hash = params.getURLParameter(SharedCodeRepository.QUERY_PARAM_NAME)
        if (hash !== null && hash !== undefined) {
            return new SharedCodeRepository(hash)
        }
        return repository
    }
}
