import React, {useEffect, useMemo} from "react";
import {Spinner, Stack} from "@fluentui/react";
import {useNavigate, useParams} from "react-router-dom";
import {SharedNotePadObjects, useFluidRelayContext} from "./FluidRelayContext";
import {IValueChanged, SequenceDeltaEvent, SharedMap, SharedString} from "fluid-framework";
import {CollaborativeTextArea, SharedStringHelper} from "@fluid-experimental/react-inputs";

const SharedNotePad = () => {
    const {roomId, containerId} = useParams();
    const navigate = useNavigate();
    const {sharedNotePadObjects, connectToNotePadContainer} = useFluidRelayContext();

    useEffect(() => {
        if (!sharedNotePadObjects) {
            connectToNotePadContainer(containerId).then((connectedContainerId) => {
                if (containerId !== connectedContainerId) {
                    navigate(`/room/${roomId}/${connectedContainerId}`, {replace: true});
                }
            });
        }
    }, [sharedNotePadObjects, connectToNotePadContainer, containerId, navigate, roomId]);

    return <Stack className="notePadContainer">
        {sharedNotePadObjects && <NotePadTextArea sharedNotePadObjects={sharedNotePadObjects}/>}
        {!sharedNotePadObjects && <Spinner label="Connecting to Shared NotePad..."/>}
    </Stack>;
};


type NotePadTextAreaProps = {
    sharedNotePadObjects: SharedNotePadObjects;
};

const NotePadTextArea = ({sharedNotePadObjects}: NotePadTextAreaProps) => {
    const sharedStringHelper = useMemo(() => {
        return new SharedStringHelper(sharedNotePadObjects.notes);
    }, [sharedNotePadObjects]);

    useEffect(() => {
        const valueChangeHandlers: NotePadChangeHandlers = {
            notes: (sequenceDeltaEvent) => {
                console.log('Notes changed', sequenceDeltaEvent, sharedNotePadObjects.notes.getText());
            },
            cursors: (valueChanged) => {
                console.log('Cursor changed', valueChanged, sharedNotePadObjects.cursors.get(valueChanged.key));
            },
        };
        trackSharedNotePadOn(sharedNotePadObjects, valueChangeHandlers);
        return () => {
            trackSharedNotePadOff(sharedNotePadObjects, valueChangeHandlers);
        };
    }, [sharedNotePadObjects]);

    return <CollaborativeTextArea sharedStringHelper={sharedStringHelper} className="collaborativeTextArea"/>
};

type NotePadChangeHandlers = {
    [key in keyof SharedNotePadObjects]: (
        valueChanged:
            SharedNotePadObjects[key] extends SharedMap
                ? IValueChanged
                : (
                    SharedNotePadObjects[key] extends SharedString
                        ? SequenceDeltaEvent
                        : never
                    )
    ) => void
}

const trackSharedNotePadOn = (sharedNotePadObjects: SharedNotePadObjects, changeHandlers: NotePadChangeHandlers) => {
    sharedNotePadObjects.notes.on('sequenceDelta', changeHandlers.notes);
    sharedNotePadObjects.cursors.on('valueChanged', changeHandlers.cursors);
};

const trackSharedNotePadOff = (sharedNotePadObjects: SharedNotePadObjects, changeHandlers: NotePadChangeHandlers) => {
    sharedNotePadObjects.notes.off('sequenceDelta', changeHandlers.notes);
    sharedNotePadObjects.cursors.off('valueChanged', changeHandlers.cursors);
};

export default SharedNotePad;