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
define(["require", "exports", "jquery", "./viewer/Renderer", './viewer/ModelLoader'], function(require, exports, $, Renderer, ModelLoader) {
    var renderer;

    $(function () {
        renderer = new Renderer.Renderer($('#viewport')[0], $("script[type='x-shader/x-fragment'], script[type='x-shader/x-vertex']").get());

        ModelLoader.loadModel(1, function (model) {
            renderer.setCurrentModel(model);
        });

        (function tick() {
            renderer.draw();

            window.requestAnimationFrame(tick);
        })();
    });
});
//# sourceMappingURL=RWXViewer.js.map
