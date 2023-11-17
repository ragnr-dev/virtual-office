import React, {useMemo, useState} from 'react';
import {DefaultButton, IStackTokens, Spinner, Stack} from "@fluentui/react";
import {RoomsClient} from "@azure/communication-rooms";
import appConf from "./appConf";
import {useNavigate} from "react-router-dom";

const stackTokens: IStackTokens = {childrenGap: 40};

const Landing = () => {
    const roomClient = useMemo(() => new RoomsClient(appConf.getAcsConnectionString()), []);
    const navigate = useNavigate();

    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    return <Stack tokens={stackTokens}>
        <div style={{padding: '1rem'}}>Ready to Collaborate?</div>
        <DefaultButton
            text="Create a Room"
            allowDisabledFocus
            disabled={isCreatingRoom}
            onClick={() => {
                setIsCreatingRoom(true);
                roomClient.createRoom().then((room) => {
                    navigate(`/room/${room.id}`);
                }).catch((error) => {
                    setIsCreatingRoom(false);
                    alert(`Failed to create room: ${error.message}`);
                });
            }}
        />
        {isCreatingRoom && <Spinner label="Creating your room..."/>}
    </Stack>;
};

export default Landing;