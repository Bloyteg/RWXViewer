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
    private _rotationMatrix: Mat4Array;

    constructor() {
        this._cameraMatrix = mat4.create();
        mat4.lookAt(this._cameraMatrix, [0, 1, -5], [0, 1, 0], [0, 1, 0]);

        this._rotationMatrix = mat4.create();
    }

    rotateCamera(deltaX: number, deltaY: number) {
        mat4.rotate(this._rotationMatrix, this._rotationMatrix, (deltaX / 10) * (Math.PI / 180), [0, 1, 0]);
        mat4.rotate(this._rotationMatrix, this._rotationMatrix, (deltaY / 10) * (Math.PI / 180), [-1, 0, 0]);
    }

    resetCamera() {
        mat4.identity(this._rotationMatrix);
    }

    get viewMatrix(): Mat4Array {
        var viewMatrix = mat4.create();
        return mat4.multiply(viewMatrix, this._cameraMatrix, this._rotationMatrix);
    }
}