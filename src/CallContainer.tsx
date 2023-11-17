import {AzureCommunicationTokenCredential} from '@azure/communication-common';
import {
    CallAdapter,
    CallAdapterLocator,
    CallComposite,
    CallCompositeOptions,
    CompositeLocale,
    useAzureCommunicationCallAdapter
} from '@azure/communication-react';
import {PartialTheme, Theme} from '@fluentui/react';
import React, {useMemo} from 'react';
import {validate as validateUUID} from 'uuid';
import {AcsUser} from "./User";

type ContainerProps = {
    user: AcsUser;
    locator: string;
    formFactor?: 'desktop' | 'mobile';
    fluentTheme?: PartialTheme | Theme;
    callInvitationURL?: string;
    locale?: CompositeLocale;
    options?: CallCompositeOptions;
};

const isTeamsMeetingLink = (link: string): boolean => link.startsWith('https://teams.microsoft.com/l/meetup-join');
const isGroupID = (id: string): boolean => validateUUID(id);

const createCallAdapterLocator = (locator: string): CallAdapterLocator | undefined => {
    if (isTeamsMeetingLink(locator)) {
        return {meetingLink: locator};
    } else if (isGroupID(locator)) {
        return {groupId: locator};
    } else if (/^\d+$/.test(locator)) {
        // @ts-ignore
        return {roomId: locator};
    }
    return undefined;
};

const CallContainer = ({
                           user,
                           locator,
                           formFactor,
                           fluentTheme,
                           callInvitationURL,
                           locale,
                           options,
                       }: ContainerProps) => {
    const credential = useMemo(() => {
        if (!user.token) {
            return undefined;
        }
        try {
            return new AzureCommunicationTokenCredential(user.token);
        } catch {
            console.error('Failed to construct token credential');
            return undefined;
        }
    }, [user.token]);

    const callAdapterLocator = useMemo(() => createCallAdapterLocator(locator), [locator]);

    const adapter = useAzureCommunicationCallAdapter(
        {
            userId: user.userId,
            displayName: user.displayName, // Max 256 Characters
            credential: credential,
            locator: callAdapterLocator,
        },
        undefined,
        leaveCall
    );

    if (!locator) {
        return <>Provided call locator '{locator}' is not recognized.</>;
    }

    if (adapter) {
        return (
            <CallComposite
                adapter={adapter}
                formFactor={formFactor}
                fluentTheme={fluentTheme}
                callInvitationUrl={callInvitationURL}
                locale={locale}
                options={options}
            />
        );
    }
    if (credential === undefined) {
        return <>Failed to construct credential. Provided token is malformed.</>;
    }
    return <>Initializing...</>;
};

const leaveCall = async (adapter: CallAdapter): Promise<void> => {
    console.log('Disposing call');
    await adapter.leaveCall().catch((e) => {
        console.error('Failed to leave call', e);
    });
};

export default CallContainer;