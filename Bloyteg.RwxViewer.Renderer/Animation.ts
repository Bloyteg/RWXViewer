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

        export function getSequenceAnimation(animation: ModelAnimation) {
            return new SequenceAnimation(animation, Date.now());
        }
    }

    export class NoAnimation implements Animation {
        private _transform = mat4.create();

        getTransformForTime(joint: number, time: number): Mat4Array {
            return this._transform;
        }
    }

    var jointTags = {
        "pelvis": 1,
        "back": 2,
        "neck": 3,
        "head": 4,
        "rtsternum": 5,
        "rtshoulder": 6,
        "rtelbow": 7,
        "rtwrist": 8,
        "rtfingers": 9,
        "lfsternum": 10,
        "lfshoulder": 11,
        "lfelbow": 12,
        "lfwrist": 13,
        "lffingers": 14,
        "rthip": 15,
        "rtknee": 16,
        "rtankle": 17,
        "rttoes": 18,
        "lfhip": 19,
        "lfknee": 20,
        "lfankle": 21,
        "lftoes": 22,
        "neck2": 23,
        "tail": 24,
        "tail2": 25,
        "tail3": 26,
        "tail4": 27,
        "obj1": 28,
        "obj2": 29,
        "obj3": 30,
        "hair": 31,
        "hair2": 32,
        "hair3": 33,
        "hair4": 34,
        "rtbreast": 35,
        "lfbreast": 36,
        "rteye": 37,
        "lfeye": 38,
        "lips": 39,
        "nose": 40,
        "rtear": 41,
        "lfear": 42
    };

    export class SequenceAnimation implements Animation {
        private _startTime: number;
        private _framesPerMS: number;
        private _totalFrames: number;

        private _identity: Mat4Array;
        private _transform: Mat4Array;
        private _quaternion: Vec4Array;
        private _keyframesByJoint: { [tag: number]: { keyframe: number; rotation: Vec4Array; translation: Vec4Array }[] };

        constructor(animation: ModelAnimation, startTime: number) {
            this._startTime = startTime;
            this._framesPerMS = animation.FramesPerSecond / 1000;
            this._totalFrames = Math.floor(animation.FrameCount / this._framesPerMS);

            this._transform = mat4.create();
            this._quaternion = quat.identity(quat.create());
            this._identity = mat4.create();


            this._keyframesByJoint = this.buildKeyframesByJoint(animation);
        }

        private buildKeyframesByJoint(animation: RwxViewer.ModelAnimation) {
            var result: any = {};

            animation.Joints.forEach(joint => {
                var tag = this.getJointTagFromName(joint.Name);

                result[tag] = joint.Keyframes.map(frame => {
                    var rotation = quat.fromValues(frame.Rotation.X, frame.Rotation.Y, -frame.Rotation.Z, frame.Rotation.W);
                    quat.invert(rotation, rotation);

                    return {
                        keyframe: Math.floor(frame.Keyframe / this._framesPerMS),
                        rotation: rotation,
                        translation: vec3.fromValues(frame.Translation.X, frame.Translation.Y, frame.Translation.Z)
                    }
                });
            });

            return result;
        }

        private getJointTagFromName(name: string) {
            return jointTags[name] || null;
        }

        getTransformForTime(joint: number, time: number): Mat4Array {
            var frame = Math.floor((time - this._startTime) % this._totalFrames);

            if (!(joint in this._keyframesByJoint)) {
                return this._identity;
            }

            //TODO: This is a naive approach.  Add memoization or pre-baking of keyframes in the future.
            var keyframes = this._keyframesByJoint[joint];
            var length = keyframes.length - 1;

            var interpolateTransform = (firstFrameIndex, secondFrameIndex) => {
                var interpFactor = (frame - keyframes[firstFrameIndex].keyframe) / Math.abs(keyframes[secondFrameIndex].keyframe - keyframes[firstFrameIndex].keyframe);

                quat.slerp(this._quaternion, keyframes[firstFrameIndex].rotation, keyframes[secondFrameIndex].rotation, interpFactor);
                return mat4.fromQuat(this._transform, this._quaternion);
            }

            for (var index = 0; index < length; ++index) {
                var nextIndex = index + 1;

                if (keyframes[index].keyframe <= frame && keyframes[nextIndex].keyframe >= frame) {
                    return interpolateTransform(index, index + 1);
                } else if (nextIndex === length && keyframes[nextIndex].keyframe <= frame) {
                    return interpolateTransform(index + 1, 0);
                }
            }

            //  console.log("Frame " + frame + " had no corresponding keyframe range for joint " + joint + ", there's a total of " + this._totalFrames + " frames and the max frame for this joint is " + keyframes[length-1].keyframe);
            return this._identity;
        }
    }
}