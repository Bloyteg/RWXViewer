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
    export interface Animation {
        getTransformForTime(joint: number, time: number): Mat4Array;
    }

    export module Animation {
        export function getDefaultAnimation() {
            return new NoAnimation();
        }

        export function getRotationAnimation() {
            return new RotationAnimation(Date.now());
        }
    }

    export class NoAnimation implements Animation {
        private _transform = mat4.create();

        getTransformForTime(joint: number, time: number): Mat4Array {
            return this._transform;
        }
    }

    export class RotationAnimation implements Animation {
        private _startTime: number;
        private _transform: Mat4Array;
        private _quaternion: Vec4Array;
        private _framesPerSecond: number;

        constructor(startTime: number) {
            this._startTime = startTime;
            this._framesPerSecond = 30;
            this._transform = mat4.create();
            this._quaternion = quat.create();
        }

        getTransformForTime(joint: number, time: number): Mat4Array {
            var delta = time - this._startTime;
            var frame = delta * (this._framesPerSecond / 1000);
            var interpFactor = (frame % (this._framesPerSecond * 10)) / (this._framesPerSecond * 10);

            quat.identity(this._quaternion);
            quat.rotateY(this._quaternion, this._quaternion, interpFactor * (2 * Math.PI));
            mat4.fromQuat(this._transform, this._quaternion);

            return this._transform;
        }
    }
}