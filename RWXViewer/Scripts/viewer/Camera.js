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
    var ZOOM_FACTOR = 0.95;
    var DEFAULT_RADIUS_SCALE = 1.0;
    var DEFAULT_CAMERA_DISTANCE = 5.0;
    var ROTATION_SPEED = 0.5;

    var Camera = (function () {
        function Camera(viewportWidth, viewportHeight) {
            this.reset();
            this.setViewpowerSize(viewportWidth, viewportHeight);
            this.update();
        }
        Camera.prototype.setViewpowerSize = function (width, height) {
            this._viewportWidth = width;
            this._viewportHeight = height;
        };

        Camera.prototype.reset = function () {
            this._cameraMatrix = mat4.create();
            this._cameraMatrixInverse = mat4.create();

            this._offset = vec3.create();
            this._position = vec3.fromValues(0, 0, -DEFAULT_CAMERA_DISTANCE);
            this._target = vec3.create();
            this._pan = vec3.create();
            this._panOffset = vec3.create();
            this._up = vec3.fromValues(0, 1, 0);

            this._upQuaternion = quat.fromValues(1, 0, 0, 0);
            this._upQuarternionInverse = quat.create();
            quat.invert(this._upQuarternionInverse, this._upQuaternion);

            this._thetaDelta = 0;
            this._phiDelta = 0;
            this._scale = DEFAULT_RADIUS_SCALE;
        };

        Camera.prototype.rotate = function (deltaX, deltaY) {
            this._thetaDelta -= 2 * Math.PI * deltaX / this._viewportWidth * ROTATION_SPEED;
            this._phiDelta -= 2 * Math.PI * deltaY / this._viewportHeight * ROTATION_SPEED;
        };

        Camera.prototype.zoomIn = function (zoomFactor) {
            this._scale *= (zoomFactor || ZOOM_FACTOR);
        };

        Camera.prototype.zoomOut = function (zoomFactor) {
            this._scale /= (zoomFactor || ZOOM_FACTOR);
        };

        Camera.prototype.pan = function (deltaX, deltaY) {
            mat4.invert(this._cameraMatrixInverse, this._cameraMatrix);
            vec3.sub(this._offset, this._position, this._target);
            var distance = vec3.length(this._offset);

            //TODO: Replace 45 with FOV constant.
            distance *= Math.tan((45 / 2) * Math.PI / 180.0);

            var xDistance = 2 * deltaX * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[0], this._cameraMatrixInverse[1], this._cameraMatrixInverse[2]);
            vec3.scale(this._panOffset, this._panOffset, xDistance);
            vec3.add(this._pan, this._pan, this._panOffset);

            var yDistance = 2 * deltaY * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[4], this._cameraMatrixInverse[5], this._cameraMatrixInverse[6]);
            vec3.scale(this._panOffset, this._panOffset, yDistance);
            vec3.add(this._pan, this._pan, this._panOffset);
        };

        Camera.prototype.update = function () {
            vec3.sub(this._offset, this._position, this._target);
            vec3.transformQuat(this._offset, this._offset, this._upQuaternion);

            var offsetX = this._offset[0];
            var offsetY = this._offset[1];
            var offsetZ = this._offset[2];

            var theta = Math.atan2(offsetX, offsetZ);
            var phi = Math.atan2(Math.sqrt(offsetX * offsetX + offsetZ * offsetZ), offsetY);

            theta += this._thetaDelta;
            phi += this._phiDelta;

            var radius = vec3.length(this._offset) * this._scale;

            this._offset[0] = radius * Math.sin(phi) * Math.sin(theta);
            this._offset[1] = radius * Math.cos(phi);
            this._offset[2] = radius * Math.sin(phi) * Math.cos(theta);

            vec3.transformQuat(this._offset, this._offset, this._upQuarternionInverse);

            vec3.add(this._target, this._target, this._pan);
            vec3.add(this._position, this._target, this._offset);

            this._scale = DEFAULT_RADIUS_SCALE;
            this._thetaDelta = 0;
            this._phiDelta = 0;
            vec3.set(this._pan, 0, 0, 0);

            mat4.lookAt(this._cameraMatrix, this._position, this._target, this._up);
        };

        Object.defineProperty(Camera.prototype, "matrix", {
            get: function () {
                return this._cameraMatrix;
            },
            enumerable: true,
            configurable: true
        });
        return Camera;
    })();
    exports.Camera = Camera;
});
//# sourceMappingURL=Camera.js.map
