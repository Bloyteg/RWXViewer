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

import $ = require("jquery");
import Renderer = require("./viewer/Renderer");
import PathObjectLoader = require('./viewer/ObjectPathItemLoader');

var renderer: Renderer.Renderer;

enum CameraState {
    None,
    Rotating,
    Panning
}

$(() => {
    renderer = new Renderer.Renderer(<HTMLCanvasElement>$('#viewport')[0]);

    (() => {
        var cameraState = CameraState.None;
        var lastMouseX = null;
        var lastMouseY = null;

        $("#viewport").mousedown((event) => {
            cameraState = event.button == 0 ? CameraState.Rotating : CameraState.Panning;
            lastMouseX = null;
            lastMouseY = null;
        });

        $("#viewport").on("contextmenu", () => false);

        $(document).mouseup(() => cameraState = CameraState.None);

        $(document).mousemove((event) => {
            var deltaX;
            var deltaY;

            if (cameraState === CameraState.Rotating) {
                event.preventDefault();

                if (lastMouseX && lastMouseY) {
                    deltaX = event.pageX - lastMouseX;
                    deltaY = event.pageY - lastMouseY;
                    renderer.camera.rotate(-deltaX, deltaY);
                    renderer.camera.update();
                }

                lastMouseX = event.pageX;
                lastMouseY = event.pageY;
            } else if (cameraState == CameraState.Panning) {
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

        $('#viewport').on("mousewheel", false, event => {
            event.preventDefault();
            event.stopPropagation();

            var originalEvent = event.originalEvent;

            var delta: number = (<any>originalEvent).wheelDelta || -(<any>originalEvent).detail;

            if (delta > 0) {
                renderer.camera.zoomOut(0.95);
            } else {
                renderer.camera.zoomIn(0.95);
            }

            renderer.camera.update();
        });
    })();

    $.when(renderer.initialize(), PathObjectLoader.loadModel(1))
     .done((_, model) => {
         renderer.setCurrentModel(model);

         function tick() {
             renderer.draw();
             window.requestAnimationFrame(tick);
         }

        tick();
    });
});