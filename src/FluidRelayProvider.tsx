import React, {Reducer, useEffect, useMemo, useReducer} from "react";
import type {
    AzureContainerServices,
    AzureMember,
    AzureRemoteConnectionConfig,
    IAzureAudience
} from "@fluidframework/azure-client";
import {AzureClient} from "@fluidframework/azure-client";
import appConf from "./appConf";
import {InsecureTokenProvider} from "@fluidframework/test-client-utils";
import {FluidUser} from "./User";
import FluidRelayContext, {fluidContainerSchema, SharedNotePadObjects} from "./FluidRelayContext";
import {IFluidContainer} from "fluid-framework";


type FluidContainerServices = {
    container: IFluidContainer;
    services: AzureContainerServices;
};

type FluidRelayProviderProps = {
    user: FluidUser;
    children?: React.ReactNode;
};

const FluidRelayProvider = ({user, children}: FluidRelayProviderProps) => {
    const azureClient = useMemo(() => createAzureClient(user), [user]);

    const [fluidContainerServices, dispatchFluidContainerServices] = useReducer<Reducer<FluidContainerServices | null, FluidContainerServices>>(
        (_, action) => ({...action}),
        null
    );

    useEffect(() => {
        return () => {
            if (fluidContainerServices) {
                trackAudienceOff(fluidContainerServices.services.audience);
            }
        };
    }, [fluidContainerServices]);

    return <FluidRelayContext.Provider value={{
        user: user,
        container: fluidContainerServices?.container,
        services: fluidContainerServices?.services,
        sharedNotePadObjects: fluidContainerServices?.container.initialObjects as SharedNotePadObjects,
        connectToNotePadContainer: async (containerId: string | undefined) => {
            if (containerId) {
                const connectedFluidContainerServices = await connectToContainer(containerId, azureClient);
                trackAudienceOn(connectedFluidContainerServices.services.audience);
                dispatchFluidContainerServices(connectedFluidContainerServices);
                return containerId;
            }

            const [newContainerId, connectedFluidContainerServices] = await createContainer(azureClient);
            trackAudienceOn(connectedFluidContainerServices.services.audience);
            dispatchFluidContainerServices(connectedFluidContainerServices);
            return newContainerId;
        }
    }}>{children}</FluidRelayContext.Provider>
};

const createAzureClient = (user: FluidUser) => {
    const config: AzureRemoteConnectionConfig = {
        tenantId: appConf.getFluidRelayTenantId(),
        tokenProvider: new InsecureTokenProvider(
            appConf.getFluidRelayTenantKey(),
            user,
        ),
        endpoint: appConf.getFluidRelayServiceEndpoint(),
        type: "remote",
    };

    return new AzureClient({
        connection: config,
    });
};

const connectToContainer = async (containerId: string, azureClient: AzureClient) => {
    try {
        console.log(`Connecting to container ${containerId} ...`);
        return await azureClient.getContainer(containerId, fluidContainerSchema);
    } catch (error) {
        console.error('Failed to connect to container', containerId, error);
        throw error;
    }
};

const createContainer = async (azureClient: AzureClient): Promise<[containerId: string, fluidContainerServices: FluidContainerServices]> => {
    let fluidContainerServices: FluidContainerServices;
    try {
        console.log('Creating container ...');
        fluidContainerServices = await azureClient.createContainer(fluidContainerSchema);
    } catch (error) {
        console.error('Failed to create new container', error);
        throw error;
    }
    try {
        const newContainerId = await fluidContainerServices.container.attach();
        console.log(`Attached to container ${newContainerId} .`);
        return [newContainerId, fluidContainerServices];
    } catch (error) {
        console.error('Failed to attach to new container', error);
        throw error;
    }
};

const handleMemberAdded = (clientId: string, member: AzureMember) => {
    console.log(`${member.userName} has connected to the shared notepad (client: ${clientId})`);
};

const handleMemberRemoved = (clientId: string, member: AzureMember) => {
    console.log(`${member.userName} has disconnected from the shared notepad (client: ${clientId})`);
};

const trackAudienceOn = (audience: IAzureAudience) => {
    audience.on('memberAdded', handleMemberAdded);
    audience.on('memberRemoved', handleMemberRemoved);
};

const trackAudienceOff = (audience: IAzureAudience) => {
    audience.off('memberAdded', handleMemberAdded);
    audience.off('memberRemoved', handleMemberRemoved);
};

export default FluidRelayProvider;