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
define(["require", "exports"], function(require, exports) {
    var Camera = (function () {
        function Camera() {
            this._cameraMatrix = mat4.create();
            mat4.lookAt(this._cameraMatrix, [0, 1, -5], [0, 1, 0], [0, 1, 0]);

            this._rotationMatrix = mat4.create();
        }
        Camera.prototype.rotateCamera = function (deltaX, deltaY) {
            mat4.rotate(this._rotationMatrix, this._rotationMatrix, (deltaX / 10) * (Math.PI / 180), [0, 1, 0]);
            mat4.rotate(this._rotationMatrix, this._rotationMatrix, (deltaY / 10) * (Math.PI / 180), [-1, 0, 0]);
        };

        Camera.prototype.resetCamera = function () {
            mat4.identity(this._rotationMatrix);
        };

        Object.defineProperty(Camera.prototype, "viewMatrix", {
            get: function () {
                var viewMatrix = mat4.create();
                return mat4.multiply(viewMatrix, this._cameraMatrix, this._rotationMatrix);
            },
            enumerable: true,
            configurable: true
        });
        return Camera;
    })();
    exports.Camera = Camera;
});
//# sourceMappingURL=Camera.js.map
