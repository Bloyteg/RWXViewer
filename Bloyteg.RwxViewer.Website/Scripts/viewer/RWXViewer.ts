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
var types = [{ name: "Model", type: 0 }, { name: "Avatar", type: 1 }];

class ViewModel {
    worlds: KnockoutObservableArray<ObjectPathItemLoader.IObjectPathWorld>;
    models: KnockoutObservableArray<ObjectPathItemLoader.IObjectPathModel>;
    types: KnockoutObservableArray<{ name: string; type: number }>;
    animations: KnockoutObservableArray<ObjectPathItemLoader.IObjectPathAnimation>;
    modelsByType: KnockoutComputed<ObjectPathItemLoader.IObjectPathModel[]>;

    selectedWorld: KnockoutObservable<ObjectPathItemLoader.IObjectPathWorld>;
    selectedModel: KnockoutObservable<ObjectPathItemLoader.IObjectPathModel>;
    selectedType: KnockoutObservable<{ name: string; type: number }>;
    selectedAnimation: KnockoutObservable<ObjectPathItemLoader.IObjectPathAnimation>;

    errorMessage: KnockoutObservable<string>;

    constructor() {
        this.worlds = ko.observableArray([]);
        this.models = ko.observableArray([]);
        this.types = ko.observableArray(types);
        this.animations = ko.observableArray([]);

        this.selectedWorld = ko.observable(null);
        this.selectedModel = ko.observable(null);
        this.selectedType = ko.observable(types[0]);
        this.selectedAnimation = ko.observable(null);
        this.errorMessage = ko.observable(null);

        this.modelsByType = ko.computed(() => {
            return this.models().filter(model => model.type === this.selectedType().type);
        });

        var self = this;

        this.selectedWorld.subscribe(world => {
            if (world) {
                ObjectPathItemLoader.getModels(world.worldId).done(models => self.models(models));
                ObjectPathItemLoader.getAnimations(world.worldId).done(animations => self.animations(animations));
            } else {
                self.models([]);
                self.animations([]);
            }
        });

        this.errorMessage.subscribe(message => {
            if (message) {
                $('#error').fadeIn(FADE_TIME);
            } else {
                $('#error').fadeOut(FADE_TIME);
            }
        });

        this.selectedAnimation.subscribe(animation => {
            self.errorMessage(null);
            renderer.setCurrentAnimation(null);

            if (animation) {
                $.when(ObjectPathItemLoader.loadAnimation(animation.worldId, animation.name), $('#loading').fadeIn(FADE_TIME))
                    .done((modelAnimation: RwxViewer.ModelAnimation) => {
                        renderer.setCurrentAnimation(modelAnimation);
                        $('#loading').fadeOut(FADE_TIME);
                    }).fail(() => {
                        renderer.setCurrentAnimation(null);
                        self.errorMessage("Failed to load the selected animation.");
                        $('#loading').fadeOut(FADE_TIME);
                    });
            }
        });

        this.selectedModel.subscribe(model => {
            self.errorMessage(null);
            self.selectedAnimation(null);
            renderer.setCurrentModel(null);

            if (model) {
                $.when(ObjectPathItemLoader.loadModel(model.worldId, model.name), $('#loading').fadeIn(FADE_TIME))
                    .done((result: RwxViewer.Model) => {
                        ObjectPathItemLoader.loadTextures(model.worldId, result.Materials).done(textures => {

                            Object.keys(textures).forEach(imageKey => RwxViewer.TextureCache.addImageToCache(imageKey, textures[imageKey]));

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

function resizeViewport() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (renderer) {
        renderer.updateViewport(canvas.clientWidth, canvas.clientHeight);
    }
}

$(window).resize(resizeViewport);

var viewModel = new ViewModel();

$('#error').css('visibility', 'visible').hide();

$.when(ObjectPathItemLoader.getWorlds(),
    ShaderProgramLoader.loadShaderProgram(gl, "vertexShader.glsl", "fragmentShader.glsl"),
    ShaderProgramLoader.loadShaderProgram(gl, "SpatialGridVertexShader.glsl", "SpatialGridFragmentShader.glsl"),
    ShaderProgramLoader.loadShaderProgram(gl, "OverlayVertexShader.glsl", "OverlayFragmentShader.glsl"))
    .done((worlds: ObjectPathItemLoader.IObjectPathWorld[], mainProgram: RwxViewer.ShaderProgram, gridProgram: RwxViewer.ShaderProgram, overlayProgram: RwxViewer.ShaderProgram) => {
        resizeViewport();
        viewModel.worlds(worlds);
        ko.applyBindings(viewModel);
        renderer.initialize(mainProgram, gridProgram, overlayProgram);

        $('#loading').fadeOut(FADE_TIME);

        CameraController.registerCamera(renderer.camera);
        tick();
    });

function tick() {
    renderer.draw(Date.now());
    window.requestAnimationFrame(tick);
}


var allGroups = $('#sidebar .group');

allGroups.click(function () {
    var currentElement = $(this);
    var currentState = currentElement.attr('data-state');

    allGroups.attr('data-state', '');
    currentElement.attr('data-state', currentState === 'selected' ? '' : 'selected');
});

$('#sidebar .group .content').click(e => {
    e.stopPropagation();
});