import {QueryParams} from "../QueryParams";
import {SharedCodeRunConfiguration} from "../Repositories";

export enum RunConfigurationType {
    Run = "Run",
    Test = "Test",
    Cgen = "Cgen",
}

export function toSharedRunConfiguration(runConfigurationType: string): SharedCodeRunConfiguration {
    switch (runConfigurationType) {
        case "Run":
            return SharedCodeRunConfiguration.Run
        case "Test":
            return SharedCodeRunConfiguration.Test
        case "Cgen":
            return SharedCodeRunConfiguration.Cgen
        default:
            throw new Error(`Unknown run configuration type: ${runConfigurationType}`)
    }
}

export function getRunConfigurationTypeByShared(sharedRunConfiguration: SharedCodeRunConfiguration): RunConfigurationType {
    switch (sharedRunConfiguration) {
        case SharedCodeRunConfiguration.Run:
            return RunConfigurationType.Run
        case SharedCodeRunConfiguration.Test:
            return RunConfigurationType.Test
        case SharedCodeRunConfiguration.Cgen:
            return RunConfigurationType.Cgen
        default:
            return RunConfigurationType.Run
    }
}

function getRunConfigurationTypeByString(runConfigurationType: string): RunConfigurationType {
    switch (runConfigurationType) {
        case "Run":
            return RunConfigurationType.Run
        case "Test":
            return RunConfigurationType.Test
        case "Cgen":
            return RunConfigurationType.Cgen
        default:
            throw new Error(`Unknown run configuration type: ${runConfigurationType}`)
    }
}

export class RunConfigurationManager {
    private static readonly QUERY_PARAM_NAME = "runConfiguration"
    private static readonly LOCAL_STORAGE_KEY = "run-configuration"
    private static readonly LOCAL_STORAGE_BUILD_ARGUMENTS_KEY = "build-arguments"
    private static readonly LOCAL_STORAGE_RUN_ARGUMENTS_KEY = "run-arguments"

    private readonly queryParams: QueryParams
    private currentConfiguration: RunConfigurationType = RunConfigurationType.Run
    private fromQueryParam: boolean = false

    private readonly runButton = document.querySelector(".js-run__action")!
    private readonly runButtonLabel = document.querySelector(".js-run__action .label")!
    private readonly openRunButton = document.querySelector(".js-open-run-select")!
    private readonly configurationsList = document.querySelector(".js-run-configurations-list")!
    private readonly configurations = document.querySelectorAll(".js-configuration")!
    private readonly buildArgumentsInput = document.querySelector(".js-build-arguments-input") as HTMLInputElement
    private readonly runArgumentsInput = document.querySelector(".js-run-arguments-input") as HTMLInputElement

    private onChange: (type: RunConfigurationType) => void = () => {
    }
    private onSelect: (type: RunConfigurationType) => void = () => {
    }

    constructor(queryParams: QueryParams) {
        this.queryParams = queryParams

        this.mount()
    }

    get configuration(): RunConfigurationType {
        return this.currentConfiguration
    }

    public registerOnChange(callback: (type: RunConfigurationType) => void): void {
        this.onChange = callback
    }

    public registerOnSelect(callback: (type: RunConfigurationType) => void): void {
        this.onSelect = callback
    }

    public toggleConfigurationsList() {
        this.configurationsList.classList.toggle("hidden")
    }

    public setupConfiguration() {
        const configurationFromQuery = this.queryParams.getURLParameter(RunConfigurationManager.QUERY_PARAM_NAME)
        if (configurationFromQuery !== null && configurationFromQuery !== undefined) {
            this.fromQueryParam = true
            this.useConfiguration(getRunConfigurationTypeByString(configurationFromQuery))
            return
        }

        const buildArgumentsFromLocalStorage = window.localStorage.getItem(RunConfigurationManager.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY)
        if (buildArgumentsFromLocalStorage !== null && buildArgumentsFromLocalStorage !== undefined) {
            this.buildArgumentsInput.value = buildArgumentsFromLocalStorage
        }

        const runArgumentsFromLocalStorage = window.localStorage.getItem(RunConfigurationManager.LOCAL_STORAGE_RUN_ARGUMENTS_KEY)
        if (runArgumentsFromLocalStorage !== null && runArgumentsFromLocalStorage !== undefined) {
            this.runArgumentsInput.value = runArgumentsFromLocalStorage
        }

        const configurationFromLocalStorage = window.localStorage.getItem(RunConfigurationManager.LOCAL_STORAGE_KEY)
        if (configurationFromLocalStorage !== null && configurationFromLocalStorage !== undefined) {
            this.useConfiguration(getRunConfigurationTypeByString(configurationFromLocalStorage))
            return
        }

        this.useConfiguration(RunConfigurationType.Run)
    }

    public useConfiguration(runConfigurationType: RunConfigurationType) {
        this.currentConfiguration = runConfigurationType
        this.onChange(runConfigurationType)

        const runConfigurationAsString = RunConfigurationType[runConfigurationType]
        this.runButton.setAttribute("data-type", runConfigurationAsString)
        this.runButtonLabel.textContent = runConfigurationAsString

        if (runConfigurationType == RunConfigurationType.Cgen) {
            this.runButtonLabel.textContent = "Show generated C code"
        }

        if (!this.fromQueryParam) {
            // Don't update saved theme state if we're loading from query param.
            window.localStorage.setItem(RunConfigurationManager.LOCAL_STORAGE_KEY, runConfigurationAsString)
            window.localStorage.setItem(RunConfigurationManager.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY, this.buildArgumentsInput.value)
            window.localStorage.setItem(RunConfigurationManager.LOCAL_STORAGE_RUN_ARGUMENTS_KEY, this.runArgumentsInput.value)
        }

        if (this.fromQueryParam) {
            // We update the query param only if we loaded from it.
            // If we don't change, then the user can change the configuration and then reload the page.
            // In this case, the page will load with the configuration from the URL, and the user
            // will think that his configuration change has not been saved (and will not be saved
            // until he removes the configuration from the URL).
            // To avoid this, we update the URL if the user changes configuration.
            this.queryParams.updateURLParameter(RunConfigurationManager.QUERY_PARAM_NAME, runConfigurationAsString)
        }
    }

    get buildArguments(): string[] {
        return this.buildArgumentsInput.value.split(" ").filter(arg => arg.length > 0)
    }

    get runArguments(): string[] {
        return this.runArgumentsInput.value.split(" ").filter(arg => arg.length > 0)
    }

    public setBuildArguments(args: string) {
        this.buildArgumentsInput.value = args
    }

    public setRunArguments(args: string) {
        this.runArgumentsInput.value = args
    }

    private mount() {
        this.openRunButton.addEventListener("click", () => {
            this.toggleConfigurationsList()
        })

        this.buildArgumentsInput.addEventListener("input", () => {
            window.localStorage.setItem(RunConfigurationManager.LOCAL_STORAGE_BUILD_ARGUMENTS_KEY, this.buildArgumentsInput.value)
        })

        this.runArgumentsInput.addEventListener("input", () => {
            window.localStorage.setItem(RunConfigurationManager.LOCAL_STORAGE_RUN_ARGUMENTS_KEY, this.runArgumentsInput.value)
        })

        this.configurations.forEach(configuration => {
            configuration.addEventListener("click", () => {
                const configurationTypeString = configuration.getAttribute("data-type") ?? "Run"
                const configurationType = getRunConfigurationTypeByString(configurationTypeString)
                this.useConfiguration(configurationType)
                this.onSelect(configurationType)
            })
        })
    }
}
