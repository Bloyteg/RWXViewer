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
import CameraController = require("./viewer/CameraController");
import PathObjectLoader = require('./viewer/ObjectPathItemLoader');

var renderer: Renderer.Renderer;

renderer = new Renderer.Renderer(<HTMLCanvasElement>$('#viewport')[0]);

function tick() {
    renderer.draw();
    window.requestAnimationFrame(tick);
}

$.when(renderer.initialize(), PathObjectLoader.loadModel(2001))
    .done((_, model) => {
        CameraController.registerCamera(renderer.camera);
        renderer.setCurrentModel(model);
        tick();
    });
