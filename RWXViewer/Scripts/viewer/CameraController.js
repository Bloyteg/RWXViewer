define(["require", "exports"], function(require, exports) {
    var CameraState;
    (function (CameraState) {
        CameraState[CameraState["None"] = 0] = "None";
        CameraState[CameraState["Rotating"] = 1] = "Rotating";
        CameraState[CameraState["Panning"] = 2] = "Panning";
    })(CameraState || (CameraState = {}));

    function registerCamera(camera) {
        var cameraState = 0 /* None */;
        var lastMouseX = null;
        var lastMouseY = null;

        $("#viewport").mousedown(function (event) {
            cameraState = event.button == 0 ? 1 /* Rotating */ : 2 /* Panning */;
            lastMouseX = event.pageX;
            lastMouseY = event.pageY;
        });

        $("#viewport").on("contextmenu", function () {
            return false;
        });

        $(document).mouseup(function () {
            return cameraState = 0 /* None */;
        });

        $(document).mousemove(function (event) {
            function handleMouseMove(updater) {
                event.preventDefault();

                if (lastMouseX && lastMouseY) {
                    var deltaX = event.pageX - lastMouseX;
                    var deltaY = event.pageY - lastMouseY;
                    updater(deltaX, deltaY);
                }

                lastMouseX = event.pageX;
                lastMouseY = event.pageY;
            }

            if (cameraState === 1 /* Rotating */) {
                handleMouseMove(function (deltaX, deltaY) {
                    return camera.rotate(-deltaX, -deltaY);
                });
            } else if (cameraState == 2 /* Panning */) {
                handleMouseMove(function (deltaX, deltaY) {
                    return camera.pan(-deltaX, deltaY);
                });
            }
        });

        $('#viewport').on("wheel", function (event) {
            event.preventDefault();
            event.stopPropagation();

            var originalEvent = event.originalEvent;
            var delta = originalEvent.deltaY;

            if (delta > 0) {
                camera.zoomOut(0.95);
            } else {
                camera.zoomIn(0.95);
            }
        });
    }
    exports.registerCamera = registerCamera;
});
//# sourceMappingURL=CameraController.js.map
