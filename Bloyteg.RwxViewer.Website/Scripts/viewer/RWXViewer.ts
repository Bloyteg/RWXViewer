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

module Viewer {
    var FADE_TIME = 500;
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

        showBoundingBox: KnockoutObservable<boolean>;
        showCameraTarget: KnockoutObservable<boolean>;
        showModelOrigin: KnockoutObservable<boolean>;

        canvas: HTMLCanvasElement;
        renderer: RwxViewer.Renderer;

        constructor(canvas: HTMLCanvasElement, renderer: RwxViewer.Renderer) {
            this.canvas = canvas;
            this.renderer = renderer;

            this.worlds = ko.observableArray([]);
            this.models = ko.observableArray([]);
            this.types = ko.observableArray(types);
            this.animations = ko.observableArray([]);

            this.selectedWorld = ko.observable(null);
            this.selectedModel = ko.observable(null);
            this.selectedType = ko.observable(types[0]);
            this.selectedAnimation = ko.observable(null);
            this.errorMessage = ko.observable(null);

            this.showBoundingBox = ko.observable(false);
            this.showCameraTarget = ko.observable(true);
            this.showModelOrigin = ko.observable(false);

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

            this.showBoundingBox.subscribe(value => {
                if (value) {
                    renderer.showBoundingBox();
                } else {
                    renderer.hideBoundingBox();
                }
            });

            this.showCameraTarget.subscribe(value => {
                if (value) {
                    renderer.showCameraTarget();
                } else {
                    renderer.hideCameraTarget();
                }
            });

            this.showModelOrigin.subscribe(value => {
                if (value) {
                    renderer.showOriginAxes();
                } else {
                    renderer.hideOriginAxes();
                }
            });
        }

        resetCamera() {
            this.renderer.camera.reset();
        }

        hideError() {
            this.errorMessage(null);
        }

        saveScreenshot(_, event) {
            var dataUrl: string = this.canvas.toDataURL();
            var data = atob(dataUrl.substring("data:image/png;base64,".length));
            var asArray = new Uint8Array(data.length);

            for (var index = 0; index < data.length; ++index) {
                asArray[index] = data.charCodeAt(index);
            }

            var blob: Blob;

            if (window.navigator.msSaveBlob) {
                blob = new Blob([asArray.buffer], { type: "image/png" });
                window.navigator.msSaveBlob(blob, "screenshot.png");
                return false;
            } else {
                blob = new Blob([asArray.buffer], { type: "image/png" });
                event.currentTarget.href = URL.createObjectURL(blob);
                return true;
            }
        }
    }

    function setupSidebar() {
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

        setupSliders();
    }

    function setupSliders() {
        $('#azimuthSlider').roundSlider();
        $('#altitudeSlider').roundSlider();
    }

    function startRenderer(canvas: HTMLCanvasElement, renderer: RwxViewer.Renderer, gl: WebGLRenderingContext, viewModel: ViewModel) {
        function resizeViewport() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            if (renderer) {
                renderer.updateViewport(canvas.clientWidth, canvas.clientHeight);
            }
        }

        function tick() {
            window.requestAnimationFrame(tick);
            renderer.draw(Date.now());
        }

        $(window).resize(resizeViewport);

        $.when(ObjectPathItemLoader.getWorlds(),
            ShaderProgramLoader.loadShaderProgram(gl, "ModelVertexShader.glsl", "ModelFragmentShader.glsl"),
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
    }

    export function start() {
        var canvas = <HTMLCanvasElement>document.getElementById("viewport");
        var glOptions: any = { preserveDrawingBuffer: true };
        var gl = <WebGLRenderingContext>(canvas.getContext("webgl", glOptions) || canvas.getContext("experimental-webgl", glOptions));
        var renderer: RwxViewer.Renderer = new RwxViewer.Renderer(gl);

        $('#error').css('visibility', 'visible').hide();

        setupSidebar();
        startRenderer(canvas, renderer, gl, new ViewModel(canvas, renderer));
    }
};

$(document).ready(Viewer.start);