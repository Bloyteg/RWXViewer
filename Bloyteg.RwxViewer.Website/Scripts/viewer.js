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
var CameraController;
(function (CameraController) {
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
    CameraController.registerCamera = registerCamera;
})(CameraController || (CameraController = {}));
(function ($) {
    $.fn.roundSlider = function () {
        $(this).each(function () {
            var slider = $(this);

            slider.hide();
            slider.after('<div id="azimuthSlider" class="roundSlider">  \
                     <div class="outerCircle">                 \
                         <div class="innerCircle" >            \
                             <div class="valueDisplay"></div>  \
                         </div>                                \
                     </div>                                    \
                     <div class="sliderHandle" ></div>         \
                 </div>');

            var sliderRegion = slider.next('.roundSlider');
            var sliderHandle = sliderRegion.find('.sliderHandle');
            var sliderOuterCircle = sliderRegion.find('.outerCircle');
            var sliderDisplay = sliderRegion.find('.valueDisplay');
            var mouseDown = false;

            function setValue(angle, notify) {
                slider.val(angle);

                if (notify) {
                    slider.change();
                }

                sliderDisplay.html(angle + '&deg;');

                var angleInRadians = angle * (Math.PI / 180);

                sliderHandle.css({
                    top: Math.sin(angleInRadians) * 56 + (sliderOuterCircle.height() / 2 - sliderHandle.height() / 2 + 4),
                    left: -Math.cos(angleInRadians) * 56 + (sliderOuterCircle.width() / 2 - sliderHandle.width() / 2 + 4)
                });
            }

            slider.change(function () {
                setValue(slider.val(), false);
            });

            setValue(0, true);

            sliderHandle.mousedown(function (event) {
                event.preventDefault();
                mouseDown = true;
            });

            $(document).mouseup(function () {
                mouseDown = false;
            });

            $(document).mousemove(function (event) {
                if (mouseDown) {
                    event.preventDefault();

                    var offset = sliderOuterCircle.offset();
                    var newPosition = {
                        left: event.pageX - offset.left - (sliderOuterCircle.width() / 2),
                        top: event.pageY - offset.top - (sliderOuterCircle.height() / 2)
                    };

                    var angle = Math.floor(Math.atan2(newPosition.top, -newPosition.left) * 180 / Math.PI);
                    angle = angle < 0 ? 360 + (angle % 360) : (angle % 360);

                    setValue(angle, true);
                }
            });
        });
    };
})(jQuery);
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
var ShaderProgramLoader;
(function (ShaderProgramLoader) {
    function loadShaderProgram(gl, vertexShader, fragmentShader) {
        var shaderLocation = "/Content/Shaders/";
        var deferred = $.Deferred();

        $.when($.get(shaderLocation + vertexShader), $.get(shaderLocation + fragmentShader)).done(function (vertexShaderData, fragmentShaderData) {
            return deferred.resolve(new RwxViewer.ShaderProgram(gl, vertexShaderData[0], fragmentShaderData[0]));
        }).fail(function () {
            return deferred.fail();
        });

        return deferred.promise();
    }
    ShaderProgramLoader.loadShaderProgram = loadShaderProgram;
})(ShaderProgramLoader || (ShaderProgramLoader = {}));
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
var ObjectPathItemLoader;
(function (ObjectPathItemLoader) {
    function loadModel(worldId, modelName) {
        var deferred = $.Deferred();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Models/" + modelName).done(function (data) {
            return deferred.resolve(data);
        }).fail(function () {
            return deferred.reject();
        });

        return deferred.promise();
    }
    ObjectPathItemLoader.loadModel = loadModel;

    function loadAnimation(worldId, animationName) {
        var deferred = $.Deferred();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Animations/" + animationName).done(function (data) {
            return deferred.resolve(data);
        }).fail(function () {
            return deferred.reject();
        });

        return deferred.promise();
    }
    ObjectPathItemLoader.loadAnimation = loadAnimation;

    function loadTexture(worldId, textureName) {
        var deferred = $.Deferred();

        var image = new Image();
        image.onload = function () {
            deferred.resolve({ image: image, textureName: textureName });
        };

        image.onerror = function () {
            deferred.reject();
        };

        image.src = "/api/ObjectPath/Worlds/" + worldId + "/Textures/" + textureName;

        return deferred.promise();
    }

    function loadTextures(worldId, materials) {
        var deferred = $.Deferred();

        var images = materials.map(function (material) {
            return material.Texture;
        }).concat(materials.map(function (material) {
            return material.Mask;
        })).filter(function (textureName, index, self) {
            return textureName !== null && self.indexOf(textureName) == index;
        }).map(function (textureName) {
            return loadTexture(worldId, textureName);
        });

        $.when.apply($, images).done(function () {
            var textures = {};
            var length = arguments.length;

            for (var index = 0; index < length; ++index) {
                var item = arguments[index];
                textures[item.textureName] = item.image;
            }

            deferred.resolve(textures);
        }).fail(function () {
            return deferred.reject();
        });

        return deferred.promise();
    }
    ObjectPathItemLoader.loadTextures = loadTextures;

    function getWorlds() {
        var deferred = $.Deferred();

        $.getJSON("/api/ObjectPath/Worlds").done(function (data) {
            return deferred.resolve(data);
        }).fail(function () {
            return deferred.reject();
        });

        return deferred.promise();
    }
    ObjectPathItemLoader.getWorlds = getWorlds;

    function getModels(worldId) {
        var deferred = $.Deferred();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Models").done(function (data) {
            return deferred.resolve(data);
        }).fail(function () {
            return deferred.reject();
        });

        return deferred.promise();
    }
    ObjectPathItemLoader.getModels = getModels;

    function getAnimations(worldId) {
        var deferred = $.Deferred();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Animations").done(function (data) {
            return deferred.resolve(data);
        }).fail(function () {
            return deferred.reject();
        });

        return deferred.promise();
    }
    ObjectPathItemLoader.getAnimations = getAnimations;
})(ObjectPathItemLoader || (ObjectPathItemLoader = {}));
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
var Viewer;
(function (Viewer) {
    var FADE_TIME = 500;
    var types = [{ name: "Model", type: 0 }, { name: "Avatar", type: 1 }];

    var ViewModel = (function () {
        function ViewModel(canvas, renderer) {
            var _this = this;
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

            this.lightAzimuth = ko.observable(45);
            this.lightAltitude = ko.observable(315);

            this.modelsByType = ko.computed(function () {
                return _this.models().filter(function (model) {
                    return model.type === _this.selectedType().type;
                });
            });

            var self = this;

            this.selectedWorld.subscribe(function (world) {
                if (world) {
                    ObjectPathItemLoader.getModels(world.worldId).done(function (models) {
                        return self.models(models);
                    });
                    ObjectPathItemLoader.getAnimations(world.worldId).done(function (animations) {
                        return self.animations(animations);
                    });
                } else {
                    self.models([]);
                    self.animations([]);
                }
            });

            this.errorMessage.subscribe(function (message) {
                if (message) {
                    $('#error').fadeIn(FADE_TIME);
                } else {
                    $('#error').fadeOut(FADE_TIME);
                }
            });

            this.selectedAnimation.subscribe(function (animation) {
                self.errorMessage(null);
                renderer.setCurrentAnimation(null);

                if (animation) {
                    $.when(ObjectPathItemLoader.loadAnimation(animation.worldId, animation.name), $('#loading').fadeIn(FADE_TIME)).done(function (modelAnimation) {
                        renderer.setCurrentAnimation(modelAnimation);
                        $('#loading').fadeOut(FADE_TIME);
                    }).fail(function () {
                        renderer.setCurrentAnimation(null);
                        self.errorMessage("Failed to load the selected animation.");
                        $('#loading').fadeOut(FADE_TIME);
                    });
                }
            });

            this.selectedModel.subscribe(function (model) {
                self.errorMessage(null);
                self.selectedAnimation(null);
                renderer.setCurrentModel(null);

                if (model) {
                    $.when(ObjectPathItemLoader.loadModel(model.worldId, model.name), $('#loading').fadeIn(FADE_TIME)).done(function (result) {
                        ObjectPathItemLoader.loadTextures(model.worldId, result.Materials).done(function (textures) {
                            Object.keys(textures).forEach(function (imageKey) {
                                return RwxViewer.TextureCache.addImageToCache(imageKey, textures[imageKey]);
                            });

                            renderer.setCurrentModel(result);
                            $('#loading').fadeOut(FADE_TIME);
                        }).fail(function () {
                            renderer.setCurrentModel(result);
                            $('#loading').fadeOut(FADE_TIME);
                            self.errorMessage("Failed to load the textures for this object.");
                        });
                    }).fail(function () {
                        $('#loading').fadeOut(FADE_TIME);
                        self.errorMessage("Failed to load this object.");
                    });
                }
            });

            this.showBoundingBox.subscribe(function (value) {
                if (value) {
                    renderer.showBoundingBox();
                } else {
                    renderer.hideBoundingBox();
                }
            });

            this.showCameraTarget.subscribe(function (value) {
                if (value) {
                    renderer.showCameraTarget();
                } else {
                    renderer.hideCameraTarget();
                }
            });

            this.showModelOrigin.subscribe(function (value) {
                if (value) {
                    renderer.showOriginAxes();
                } else {
                    renderer.hideOriginAxes();
                }
            });

            this.lightAzimuth.subscribe(function () {
                renderer.setLightPosition(self.lightAzimuth(), self.lightAltitude());
            });

            this.lightAltitude.subscribe(function () {
                renderer.setLightPosition(self.lightAzimuth(), self.lightAltitude());
            });

            renderer.setLightPosition(this.lightAzimuth(), this.lightAltitude());
        }
        ViewModel.prototype.resetCamera = function () {
            this.renderer.camera.reset();
        };

        ViewModel.prototype.hideError = function () {
            this.errorMessage(null);
        };

        ViewModel.prototype.saveScreenshot = function (_, event) {
            var dataUrl = this.canvas.toDataURL();
            var data = atob(dataUrl.substring("data:image/png;base64,".length));
            var asArray = new Uint8Array(data.length);

            for (var index = 0; index < data.length; ++index) {
                asArray[index] = data.charCodeAt(index);
            }

            var blob;

            if (window.navigator.msSaveBlob) {
                blob = new Blob([asArray.buffer], { type: "image/png" });
                window.navigator.msSaveBlob(blob, "screenshot.png");
                return false;
            } else {
                blob = new Blob([asArray.buffer], { type: "image/png" });
                event.currentTarget.href = URL.createObjectURL(blob);
                return true;
            }
        };
        return ViewModel;
    })();

    function setupSidebar() {
        var allGroups = $('#sidebar .group');

        allGroups.click(function () {
            var currentElement = $(this);
            var currentState = currentElement.attr('data-state');

            allGroups.attr('data-state', '');
            currentElement.attr('data-state', currentState === 'selected' ? '' : 'selected');
        });

        $('#sidebar .group .content').click(function (e) {
            e.stopPropagation();
        });

        setupSliders();
    }

    function setupSliders() {
        $('#azimuthSlider').roundSlider();
        $('#altitudeSlider').roundSlider();
    }

    function startRenderer(canvas, renderer, gl, viewModel) {
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

        $.when(ObjectPathItemLoader.getWorlds(), ShaderProgramLoader.loadShaderProgram(gl, "ModelVertexShader.glsl", "ModelFragmentShader.glsl"), ShaderProgramLoader.loadShaderProgram(gl, "SpatialGridVertexShader.glsl", "SpatialGridFragmentShader.glsl"), ShaderProgramLoader.loadShaderProgram(gl, "OverlayVertexShader.glsl", "OverlayFragmentShader.glsl")).done(function (worlds, mainProgram, gridProgram, overlayProgram) {
            resizeViewport();
            viewModel.worlds(worlds);
            ko.applyBindings(viewModel);
            renderer.initialize(mainProgram, gridProgram, overlayProgram);

            $('#loading').fadeOut(FADE_TIME);

            CameraController.registerCamera(renderer.camera);
            tick();
        });
    }

    function start() {
        ko.bindingHandlers.defaultValue = {
            init: function (element, valueAccessor, allBindings) {
                $(element).val(ko.unwrap(valueAccessor())).change();
            }
        };

        var canvas = document.getElementById("viewport");
        var glOptions = { preserveDrawingBuffer: true };
        var gl = (canvas.getContext("webgl", glOptions) || canvas.getContext("experimental-webgl", glOptions));
        var renderer = new RwxViewer.Renderer(gl);

        $('#error').css('visibility', 'visible').hide();

        setupSidebar();
        startRenderer(canvas, renderer, gl, new ViewModel(canvas, renderer));
    }
    Viewer.start = start;
})(Viewer || (Viewer = {}));
;

$(document).ready(Viewer.start);
//# sourceMappingURL=viewer.js.map
