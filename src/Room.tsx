import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {DefaultButton, IStackTokens, Stack} from "@fluentui/react";
import CallContainer from './CallContainer';
import {CommunicationIdentityClient} from "@azure/communication-identity";
import appConf from "./appConf";
import {AcsUser} from "./User";
import {generateDisplayName} from "./nameGenerator";
import {CommunicationRoom, RoomsClient} from "@azure/communication-rooms";
import SharedNotePad from "./SharedNotePad";
import FluidRelayProvider from "./FluidRelayProvider";

const stackTokens: IStackTokens = {childrenGap: 40};

const Room = () => {
    const {roomId} = useParams();

    return <Stack tokens={stackTokens}>
        {roomId ? <CallManager roomId={roomId}/> : <>Room Not Found</>}
    </Stack>;
};

const CallManager = ({roomId}: { roomId: string }) => {
    const [user, setUser] = useState<AcsUser | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        createUserAndAddToRoom(roomId).then((user) => {
            setUser(user);
        }).catch((error) => {
            console.warn(error.message);
            switch (error.cause) {
                case 'Room Not Found':
                    setErrorMessage('This room no longer exists.');
                    break;
                case 'Room Not Open':
                case 'Room Expired':
                    setErrorMessage(error.message);
                    break;
                default:
                    setErrorMessage('There was an issue connecting to your room.');
            }
        });
    }, [roomId]);

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
    }}>
        <RoomHeader roomId={roomId} displayName={user?.displayName}/>
        {
            user?.token
            && <div className="roomContainer">
                <div className="roomCall">
                    <CallContainer locator={roomId}
                                   user={user}
                                   formFactor={'desktop'}
                                   options={{
                                       callControls: {
                                           displayType: 'compact',
                                       },
                                       galleryOptions: {
                                           layout: 'default',
                                       },
                                   }}
                    />
                </div>
                <FluidRelayProvider user={{
                    id: user.userId.communicationUserId,
                    name: user.displayName
                }}>
                    <SharedNotePad/>
                </FluidRelayProvider>
            </div>
        }
        {
            errorMessage
            && <ErrorPrompt errorMessage={errorMessage}/>
        }
    </div>;
};

const RoomHeader = ({roomId, displayName}: { roomId: string, displayName: string | undefined }) => {
    const navigate = useNavigate();

    return <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{cursor: 'pointer', padding: '1rem'}}
             onClick={() => {
                 navigate('/');
             }}
        >
            Virtual Office - Home
        </div>
        <div style={{padding: '1rem', fontSize: '0.5rem', marginTop: '0.5rem'}}>Room #: {roomId}</div>
        <div style={{padding: '1rem'}}>Welcome{displayName ? `, ${displayName}` : ''}</div>
    </div>;
}

const ErrorPrompt = ({errorMessage}: { errorMessage: string }) => {
    const navigate = useNavigate();

    return <Stack tokens={{...stackTokens, padding: '25vh 25vw 0 25vw'}}>
        <div>{errorMessage}</div>
        <DefaultButton
            text="Go Home"
            allowDisabledFocus
            onClick={() => {
                navigate("/");
            }}
        />
    </Stack>;
}

const createUserAndAddToRoom = async (roomId: string) => {
    console.log('Creating user for roomID:', roomId);

    // Issue an identity and an access token with a validity of 24 hours
    const identityClient = new CommunicationIdentityClient(appConf.getAcsConnectionString());
    const {token, expiresOn, user} = await identityClient.createUserAndToken(['voip', 'chat']);
    console.log('Created new user', user.communicationUserId, '. Access will expire on', expiresOn);

    // Add the new user to room participants
    const roomsClient = new RoomsClient(appConf.getAcsConnectionString());
    let room: CommunicationRoom;
    try {
        room = await roomsClient.getRoom(roomId);
    } catch (error) {
        throw new Error(`Room not found for roomID: ${roomId}`, {
            cause: 'Room Not Found'
        });
    }
    if (room.validFrom > new Date()) {
        throw new Error(`Room is not open until ${room.validFrom.toLocaleString()}`, {
            cause: 'Room Not Open'
        });
    }
    if (room.validUntil < new Date()) {
        throw new Error(`Room is not open after ${room.validUntil.toLocaleString()}`, {
            cause: 'Room Expired'
        });
    }

    await roomsClient.addOrUpdateParticipants(roomId, [{
        id: user,
        role: 'Presenter',
    }]);

    return {
        userId: user,
        displayName: generateDisplayName(),
        token: token,
    };
};

export default Room;