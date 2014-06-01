// Copyright 2014 Joshua R. Rodgers
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
define(["require", "exports", "jquery", "./viewer/Renderer", './viewer/ObjectPathItemLoader'], function(require, exports, $, Renderer, PathObjectLoader) {
    var renderer;

    var CameraState;
    (function (CameraState) {
        CameraState[CameraState["None"] = 0] = "None";
        CameraState[CameraState["Rotating"] = 1] = "Rotating";
        CameraState[CameraState["Panning"] = 2] = "Panning";
    })(CameraState || (CameraState = {}));

    $(function () {
        renderer = new Renderer.Renderer($('#viewport')[0]);

        (function () {
            var cameraState = 0 /* None */;
            var lastMouseX = null;
            var lastMouseY = null;

            $("#viewport").mousedown(function (event) {
                cameraState = event.button == 0 ? 1 /* Rotating */ : 2 /* Panning */;
                lastMouseX = null;
                lastMouseY = null;
            });

            $("#viewport").on("contextmenu", function () {
                return false;
            });

            $(document).mouseup(function () {
                return cameraState = 0 /* None */;
            });

            $(document).mousemove(function (event) {
                var deltaX;
                var deltaY;

                if (cameraState === 1 /* Rotating */) {
                    event.preventDefault();

                    if (lastMouseX && lastMouseY) {
                        deltaX = event.pageX - lastMouseX;
                        deltaY = event.pageY - lastMouseY;
                        renderer.camera.rotate(-deltaX, deltaY);
                        renderer.camera.update();
                    }

                    lastMouseX = event.pageX;
                    lastMouseY = event.pageY;
                } else if (cameraState == 2 /* Panning */) {
                    event.preventDefault();

                    if (lastMouseX && lastMouseY) {
                        deltaX = event.pageX - lastMouseX;
                        deltaY = event.pageY - lastMouseY;
                        renderer.camera.pan(-deltaX, deltaY);
                        renderer.camera.update();
                    }

                    lastMouseX = event.pageX;
                    lastMouseY = event.pageY;
                }
            });

            $('#viewport').on("mousewheel", false, function (event) {
                event.preventDefault();
                event.stopPropagation();

                var originalEvent = event.originalEvent;

                var delta = originalEvent.wheelDelta || -originalEvent.detail;

                if (delta > 0) {
                    renderer.camera.zoomOut(0.95);
                } else {
                    renderer.camera.zoomIn(0.95);
                }

                renderer.camera.update();
            });
        })();

        $.when(renderer.initialize(), PathObjectLoader.loadModel(1)).done(function (_, model) {
            renderer.setCurrentModel(model);

            function tick() {
                renderer.draw();
                window.requestAnimationFrame(tick);
            }

            tick();
        });
    });
});
//# sourceMappingURL=RWXViewer.js.map
