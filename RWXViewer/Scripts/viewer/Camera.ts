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

export class Camera {
    private _cameraMatrix: Mat4Array;
    private _offset: Vec3Array;
    private _position: Vec3Array;
    private _target: Vec3Array;
    private _up: Vec3Array;

    private _thetaDelta: number;
    private _phiDelta: number;
    private _scale: number;
   
    constructor() {
        this.reset();
    }

    rotate(deltaX: number, deltaY: number) {
        var rotateSpeed = 0.5;
        var width = 960;
        var height = 540;

        this._thetaDelta -= 2 * Math.PI * deltaX / width * rotateSpeed;
        this._phiDelta -= 2 * Math.PI * deltaY / height * rotateSpeed;
    }

    reset() {
        this._cameraMatrix = mat4.create();
        this._offset = vec3.create();
        this._position = vec3.fromValues(0, 0, -5);
        this._target = vec3.create();
        this._up = vec3.fromValues(0, 1, 0);

        this._thetaDelta = 0;
        this._phiDelta = 0;
        this._scale = 1;
    }

    zoomIn(zoomFactor: number) {
        this._scale *= zoomFactor;
    }

    zoomOut(zoomFactor: number) {
        this._scale /= zoomFactor;
    }

    get matrix(): Mat4Array {

        vec3.sub(this._offset, this._position, this._target);

        var offsetX = this._offset[0];
        var offsetY = this._offset[1];
        var offsetZ = this._offset[2];

        var theta = Math.atan2(offsetX, offsetZ);
        var phi = Math.atan2(Math.sqrt(offsetX * offsetX + offsetZ * offsetZ), offsetY);

        theta += this._thetaDelta;
        phi += this._phiDelta;

        //TODO: Restrict, but not right now.

        var radius = vec3.length(this._offset) * this._scale;
        this._scale = 1;
        //TODO: Restrict radius.

        this._offset[0] = radius * Math.sin(phi) * Math.sin(theta);
        this._offset[1] = radius * Math.cos(phi);
        this._offset[2] = radius * Math.sin(phi) * Math.cos(theta);

        //TODO: Pan target location.


        vec3.add(this._position, this._target, this._offset);

        this._thetaDelta = 0;
        this._phiDelta = 0;

        return mat4.lookAt(this._cameraMatrix, this._position, this._target, this._up);
    }
}