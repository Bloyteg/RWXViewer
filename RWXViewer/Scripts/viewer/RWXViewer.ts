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

var FADE_TIME = 500;

var canvas = <HTMLCanvasElement>document.getElementById("viewport");
var glOptions: any = { preserveDrawingBuffer: true };
var gl = <WebGLRenderingContext>(canvas.getContext("webgl", glOptions) || canvas.getContext("experimental-webgl", glOptions));
var renderer: RwxViewer.Renderer = new RwxViewer.Renderer(gl);

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
            renderer.setCurrentModel(null);

            if (model) {
                $.when(ObjectPathItemLoader.loadModel(model.worldId, model.name), $('#loading').fadeIn(FADE_TIME))
                    .done((result: RwxViewer.Model) => {
                        ObjectPathItemLoader.loadTextures(model.worldId, result.Materials).done(textures => {
                            renderer.setCurrentModel(result);
                            $('#loading').fadeOut(FADE_TIME);
                        }).fail(() => {
                                renderer.setCurrentModel(result);
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

$('#error').css('visibility', 'visible').hide();

$.when(ObjectPathItemLoader.getWorlds(),
       ShaderProgramLoader.loadShaderProgram(gl, "vertexShader.glsl", "fragmentShader.glsl"),
       ShaderProgramLoader.loadShaderProgram(gl, "SpatialGridVertexShader.glsl", "SpatialGridFragmentShader.glsl"))
    .done((worlds: ObjectPathItemLoader.IObjectPathWorld[], mainProgram: RwxViewer.ShaderProgram, gridProgram: RwxViewer.ShaderProgram) => {
        viewModel.worlds(worlds);
        ko.applyBindings(viewModel);
        renderer.initialize(mainProgram, gridProgram);

        $('#loading').fadeOut(FADE_TIME);

        CameraController.registerCamera(renderer.camera);
        tick();
    });

function tick() {
    renderer.draw();
    window.requestAnimationFrame(tick);
}
