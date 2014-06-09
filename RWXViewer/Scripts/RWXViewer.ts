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
import ObjectPathItemLoader = require('./viewer/ObjectPathItemLoader');

var renderer: Renderer.Renderer = new Renderer.Renderer(<HTMLCanvasElement>$('#viewport')[0]);

class ViewModel {
    worlds: KnockoutObservableArray<ObjectPathItemLoader.IObjectPathWorld>;
    models: KnockoutObservableArray<ObjectPathItemLoader.IObjectPathModel>;

    selectedWorld: KnockoutObservable<ObjectPathItemLoader.IObjectPathWorld>;
    selectedModel: KnockoutObservable<ObjectPathItemLoader.IObjectPathModel>;

    constructor() {
        this.worlds = ko.observableArray([]);
        this.models = ko.observableArray([]);
        this.selectedWorld = ko.observable(null);
        this.selectedModel = ko.observable(null);

        var self = this;

        this.selectedWorld.subscribe(world => {
            if (world) {
                ObjectPathItemLoader.getModels(world.worldId).done(models => self.models(models));
            } else {
                self.models([]);
            }
        });

        this.selectedModel.subscribe(model => {
            if (model) {
                ObjectPathItemLoader.loadModel(model.worldId, model.name).done(result => {
                    ObjectPathItemLoader.loadTextures(model.worldId, result.Materials).done(textures => {
                        renderer.setCurrentModel(result, textures);
                    });
                });
            } else {
                renderer.setCurrentModel(null, null);
            }
        });
    }
}

var viewModel = new ViewModel();

$.when(ObjectPathItemLoader.getWorlds(), renderer.initialize())
    .done((worlds) => {
        viewModel.worlds(worlds);
        ko.applyBindings(viewModel);
        CameraController.registerCamera(renderer.camera);
        tick();
    });

function tick() {
    renderer.draw();
    window.requestAnimationFrame(tick);
}
