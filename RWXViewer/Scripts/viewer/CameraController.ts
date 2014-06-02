﻿import Camera = require("Camera");

enum CameraState {
    None,
    Rotating,
    Panning
}

export function registerCamera(camera: Camera.Camera) {
    var cameraState = CameraState.None;
    var lastMouseX = null;
    var lastMouseY = null;

    $("#viewport").mousedown((event) => {
        cameraState = event.button == 0 ? CameraState.Rotating : CameraState.Panning;
        lastMouseX = event.pageX;
        lastMouseY = event.pageY;
    });

    $("#viewport").on("contextmenu", () => false);

    $(document).mouseup(() => cameraState = CameraState.None);

    $(document).mousemove((event) => {
        function handleMouseMove(updater: (deltaX: number, deltaY: number) => void) {
            event.preventDefault();

            if (lastMouseX && lastMouseY) {
                var deltaX = event.pageX - lastMouseX;
                var deltaY = event.pageY - lastMouseY;
                updater(deltaX, deltaY);
            }

            lastMouseX = event.pageX;
            lastMouseY = event.pageY;   
        }

        if (cameraState === CameraState.Rotating) {
            handleMouseMove((deltaX, deltaY) => camera.rotate(-deltaX, -deltaY));
        } else if (cameraState == CameraState.Panning) {
            handleMouseMove((deltaX, deltaY) => camera.pan(-deltaX, deltaY));
        }
    });

    $('#viewport').on("wheel", event => {
        event.preventDefault();
        event.stopPropagation();

        var originalEvent = <Event>event.originalEvent;
        var delta: number = (<WheelEvent>originalEvent).deltaY;

        if (delta > 0) {
            camera.zoomOut(0.95);
        } else {
            camera.zoomIn(0.95);
        }
    });
}