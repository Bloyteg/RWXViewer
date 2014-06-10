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
import ObjectPathItemLoader = require("./viewer/ObjectPathItemLoader");
import Model = require("./viewer/Model");

var renderer: Renderer.Renderer = new Renderer.Renderer(<HTMLCanvasElement>$('#viewport')[0]);
var FADE_TIME = 500;

class ViewModel {
    worlds: KnockoutObservableArray<ObjectPathItemLoader.IObjectPathWorld>;
    models: KnockoutObservableArray<ObjectPathItemLoader.IObjectPathModel>;

    selectedWorld: KnockoutObservable<ObjectPathItemLoader.IObjectPathWorld>;
    selectedModel: KnockoutObservable<ObjectPathItemLoader.IObjectPathModel>;

    errorMessage: KnockoutObservable<string>;

    constructor() {
        this.worlds = ko.observableArray([]);
        this.models = ko.observableArray([]);
        this.selectedWorld = ko.observable(null);
        this.selectedModel = ko.observable(null);
        this.errorMessage = ko.observable(null);

        var self = this;

        this.selectedWorld.subscribe(world => {
            if (world) {
                ObjectPathItemLoader.getModels(world.worldId).done(models => self.models(models));
            } else {
                self.models([]);
            }
        });

        this.errorMessage.subscribe(message => {
            if (message) {
                $('#error').fadeIn(FADE_TIME);
            } else {
                $('#error').fadeOut(FADE_TIME);
            }
        });

        this.selectedModel.subscribe(model => {
            self.errorMessage(null);
            renderer.setCurrentModel(null, null);

            if (model) {
                $.when(ObjectPathItemLoader.loadModel(model.worldId, model.name), $('#loading').fadeIn(FADE_TIME))
                    .done((result: Model.IModel) => {
                        ObjectPathItemLoader.loadTextures(model.worldId, result.Materials).done(textures => {
                            renderer.setCurrentModel(result, textures);
                            $('#loading').fadeOut(FADE_TIME);
                        }).fail(() => {
                                renderer.setCurrentModel(result, {});
                                $('#loading').fadeOut(FADE_TIME);
                                self.errorMessage("Failed to load the textures for this object.");
                            });
                    }).fail(() => {
                        $('#loading').fadeOut(FADE_TIME);
                        self.errorMessage("Failed to load this object.");
                    });
            }
        });
    }

    resetCamera() {
        renderer.camera.reset();
    }

    hideError() {
        this.errorMessage(null);
    }
}

var viewModel = new ViewModel();

$('#error').css('visibility','visible').hide();

$.when(ObjectPathItemLoader.getWorlds(), renderer.initialize())
    .done((worlds) => {
        viewModel.worlds(worlds);
        ko.applyBindings(viewModel);

        $('#loading').fadeOut(FADE_TIME);

        CameraController.registerCamera(renderer.camera);
        tick();
    });

function tick() {
    renderer.draw();
    window.requestAnimationFrame(tick);
}
