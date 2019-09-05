function sendMouseMove(event: MouseEvent): void {
    const remoteCoordinates: IMouseCoordinates = calculateRemoteCoordinates(event.offsetX, event.offsetY);
    const eventData: IEventData = {
        button: 0,
        keyCode: '0',
        eventType: 'mousemove',
        x: remoteCoordinates.x,
        y: remoteCoordinates.y
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendMouseDown(event: MouseEvent): void {
    const remoteCoordinates: IMouseCoordinates = calculateRemoteCoordinates(event.offsetX, event.offsetY);
    const eventData: IEventData = {
        button: event.button,
        keyCode: '0',
        eventType: 'mousedown',
        x: remoteCoordinates.x,
        y: remoteCoordinates.y
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendMouseUp(event: MouseEvent): void {
    const remoteCoordinates: IMouseCoordinates = calculateRemoteCoordinates(event.offsetX, event.offsetY);
    const eventData: IEventData = {
        button: event.button,
        keyCode: '0',
        eventType: 'mouseup',
        x: remoteCoordinates.x,
        y: remoteCoordinates.y
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendKeyDown(event: KeyboardEvent): void {
    const eventData: IEventData = {
        button: 0,
        keyCode: event.key.toLowerCase(),
        eventType: 'keydown',
        x: 0,
        y: 0
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendKeyUp(event: KeyboardEvent): void {
    const eventData: IEventData = {
        button: 0,
        keyCode: event.key.toLowerCase(),
        eventType: 'keyup',
        x: 0,
        y: 0
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function sendWheelMovement(event: WheelEvent): void {
    const eventData: IEventData = {
        button: 0,
        keyCode: '0',
        eventType: 'wheel',
        x: 0,
        y: event.deltaY > 0 ? -1 : 1
    };
    if (receiveChannel.readyState === 'open') {
        receiveChannel.send(JSON.stringify(eventData));
    }
}

function calculateRemoteCoordinates(videoOffsetX: number, videoOffsetY: number): IMouseCoordinates {
    const vWidth: number = remoteVideo.offsetWidth;
    const vHeight: number = remoteVideo.offsetHeight;

    return {
        x: Math.round(remoteVideo.videoWidth / vWidth * videoOffsetX),
        y: Math.round(remoteVideo.videoHeight / vHeight * videoOffsetY)

    };
}
