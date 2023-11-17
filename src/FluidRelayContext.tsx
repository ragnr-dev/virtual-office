import {createContext, useContext} from "react";
import {ContainerSchema, IFluidContainer, LoadableObjectClass, SharedMap, SharedString} from "fluid-framework";
import type {AzureContainerServices} from "@fluidframework/azure-client";
import {FluidUser} from "./User";

type FluidRelayContextValue = {
    user: FluidUser | undefined;
    container: IFluidContainer | undefined;
    services: AzureContainerServices | undefined;
    sharedNotePadObjects: SharedNotePadObjects | undefined;
    connectToNotePadContainer: (containerId: string | undefined) => Promise<string>;
};

const FluidRelayContext = createContext<FluidRelayContextValue>({
    user: undefined,
    container: undefined,
    services: undefined,
    sharedNotePadObjects: undefined,
    connectToNotePadContainer: async () => {
        throw new Error('Fluid Relay Context not initialized');
    },
});

export const useFluidRelayContext = () => useContext(FluidRelayContext);

export type SharedNotePadObjects = {
    cursors: SharedMap,
    notes: SharedString,
};

type NotePadInitialObjects = {
    [key in keyof SharedNotePadObjects]: LoadableObjectClass<SharedNotePadObjects[key]>;
};

interface NotePadContainerSchema extends ContainerSchema {
    initialObjects: NotePadInitialObjects
}

export const fluidContainerSchema: NotePadContainerSchema = {
    initialObjects: {
        cursors: SharedMap,
        notes: SharedString,
    }
};

export default FluidRelayContext;
