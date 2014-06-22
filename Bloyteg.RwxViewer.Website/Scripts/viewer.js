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
var FADE_TIME = 500;

var canvas = document.getElementById("viewport");
var glOptions = { preserveDrawingBuffer: true };
var gl = (canvas.getContext("webgl", glOptions) || canvas.getContext("experimental-webgl", glOptions));
var renderer = new RwxViewer.Renderer(gl);

var ViewModel = (function () {
    function ViewModel() {
        this.worlds = ko.observableArray([]);
        this.models = ko.observableArray([]);
        this.selectedWorld = ko.observable(null);
        this.selectedModel = ko.observable(null);
        this.errorMessage = ko.observable(null);

        var self = this;

        this.selectedWorld.subscribe(function (world) {
            if (world) {
                ObjectPathItemLoader.getModels(world.worldId).done(function (models) {
                    return self.models(models);
                });
            } else {
                self.models([]);
            }
        });

        this.errorMessage.subscribe(function (message) {
            if (message) {
                $('#error').fadeIn(FADE_TIME);
            } else {
                $('#error').fadeOut(FADE_TIME);
            }
        });

        this.selectedModel.subscribe(function (model) {
            self.errorMessage(null);
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
    }
    ViewModel.prototype.resetCamera = function () {
        renderer.camera.reset();
    };

    ViewModel.prototype.hideError = function () {
        this.errorMessage(null);
    };
    return ViewModel;
})();

var viewModel = new ViewModel();

$('#error').css('visibility', 'visible').hide();

$.when(ObjectPathItemLoader.getWorlds(), ShaderProgramLoader.loadShaderProgram(gl, "vertexShader.glsl", "fragmentShader.glsl"), ShaderProgramLoader.loadShaderProgram(gl, "SpatialGridVertexShader.glsl", "SpatialGridFragmentShader.glsl")).done(function (worlds, mainProgram, gridProgram) {
    viewModel.worlds(worlds);
    ko.applyBindings(viewModel);
    renderer.initialize(mainProgram, gridProgram);

    $('#loading').fadeOut(FADE_TIME);

    CameraController.registerCamera(renderer.camera);
    tick();
});

function tick() {
    renderer.draw(Date.now());
    window.requestAnimationFrame(tick);
}
//# sourceMappingURL=viewer.js.map
