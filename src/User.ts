import {CommunicationUserIdentifier} from "@azure/communication-common";
import type {IUser} from "@fluidframework/azure-client";

export type AcsUser = {
    userId: CommunicationUserIdentifier;
    displayName: string;
    token?: string;
};

export interface FluidUser extends IUser {
    id: string;
    name: string;
}