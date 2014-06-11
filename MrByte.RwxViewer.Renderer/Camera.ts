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

module RwxViewer {
    var ZOOM_FACTOR: number = 0.95;
    var DEFAULT_RADIUS_SCALE: number = 1.0;
    var DEFAULT_CAMERA_DISTANCE: number = 1;
    var ROTATION_SPEED: number = 0.5;
    var FOV: number = 45;
    var RADS_PER_DEGREE: number = Math.PI / 180;
    var PHI_EPS = 0.000001;

    export class Camera {
        private _cameraMatrix: Mat4Array;
        private _cameraMatrixInverse: Mat4Array;
        private _offset: Vec3Array;
        private _position: Vec3Array;
        private _target: Vec3Array;
        private _pan: Vec3Array;
        private _panOffset: Vec3Array;
        private _up: Vec3Array;

        private _upQuaternion: Vec4Array;
        private _upQuarternionInverse: Vec4Array;

        private _thetaDelta: number;
        private _phiDelta: number;
        private _scale: number;

        private _viewportWidth: number;
        private _viewportHeight: number;

        constructor(viewportWidth: number, viewportHeight: number) {
            this.reset();
            this.setViewpowerSize(viewportWidth, viewportHeight);
            this.update();
        }

        setViewpowerSize(width: number, height: number) {
            this._viewportWidth = width;
            this._viewportHeight = height;
        }

        reset() {
            this._cameraMatrix = mat4.create();
            this._cameraMatrixInverse = mat4.create();

            this._offset = vec3.create();
            this._position = vec3.fromValues(0.0, 0.707 * DEFAULT_CAMERA_DISTANCE, 0.707 * DEFAULT_CAMERA_DISTANCE);
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

            this.update();
        }

        rotate(deltaX: number, deltaY: number) {
            this._thetaDelta -= 2 * Math.PI * deltaX / this._viewportWidth * ROTATION_SPEED;
            this._phiDelta -= 2 * Math.PI * deltaY / this._viewportHeight * ROTATION_SPEED;

            this.update();
        }

        zoomIn(zoomFactor?: number) {
            this._scale *= (zoomFactor || ZOOM_FACTOR);

            this.update();
        }

        zoomOut(zoomFactor?: number) {
            this._scale /= (zoomFactor || ZOOM_FACTOR);

            this.update();
        }

        pan(deltaX: number, deltaY: number) {
            mat4.invert(this._cameraMatrixInverse, this._cameraMatrix);
            vec3.sub(this._offset, this._position, this._target);
            var distance = vec3.length(this._offset);

            distance *= Math.tan((FOV / 2) * RADS_PER_DEGREE);

            var xDistance: number = 2 * deltaX * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[0], this._cameraMatrixInverse[1], this._cameraMatrixInverse[2]);
            vec3.scale(this._panOffset, this._panOffset, xDistance);
            vec3.add(this._pan, this._pan, this._panOffset);

            var yDistance: number = 2 * deltaY * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[4], this._cameraMatrixInverse[5], this._cameraMatrixInverse[6]);
            vec3.scale(this._panOffset, this._panOffset, yDistance);
            vec3.add(this._pan, this._pan, this._panOffset);

            this.update();
        }

        private update() {
            vec3.sub(this._offset, this._position, this._target);
            vec3.transformQuat(this._offset, this._offset, this._upQuaternion);

            var offsetX = this._offset[0];
            var offsetY = this._offset[1];
            var offsetZ = this._offset[2];

            var theta = Math.atan2(offsetX, offsetZ);
            var phi = Math.atan2(Math.sqrt(offsetX * offsetX + offsetZ * offsetZ), offsetY);

            theta += this._thetaDelta;
            phi += this._phiDelta;

            phi = Math.max(PHI_EPS, Math.min(Math.PI - PHI_EPS, phi));


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
        }

        get matrix() { return this._cameraMatrix; }
    }
}