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

    export class SequenceAnimation implements Animation {
        private _startTime: number;
        private _framesPerMS: number;
        private _totalFrames: number;

        private _jointTags: { [name: string]: number };

        private _identity: Mat4Array;
        private _transform: Mat4Array;
        private _quaternion: Vec4Array;

        private _keyframesByJoint: { [tag: number]: { keyframe: number; rotation: Vec4Array; translation: Vec4Array }[] };

        constructor(animation: ModelAnimation, startTime: number) {
            this._startTime = startTime;
            this._framesPerMS = animation.FramesPerSecond / 1000;
            this._totalFrames = animation.FrameCount;

            this._transform = mat4.create();
            this._quaternion = quat.identity(quat.create());
            this._identity = mat4.create();

            this.buildJointTags();

            this._keyframesByJoint = this.buildKeyframesByJoint(animation);
        }

        private buildKeyframesByJoint(animation: RwxViewer.ModelAnimation) {
            var result: any = {};

            animation.Joints.forEach(joint => {
                var tag = this.getJointTagFromName(joint.Name);

                result[tag] = joint.Keyframes.map(frame => {
                    return {
                        keyframe: frame.Keyframe,
                        rotation: quat.fromValues(frame.Rotation.X, frame.Rotation.Y, -frame.Rotation.Z, frame.Rotation.W),
                        translation: vec3.fromValues(frame.Translation.X, frame.Translation.Y, frame.Translation.Z)
                    }
                });
            });

            return result;
        }

        private getJointTagFromName(name: string) {
            return this._jointTags[name] || null;
        }

        //TODO: Handle animation wrapping better.
        getTransformForTime(joint: number, time: number): Mat4Array {
            var frame = ((time - this._startTime) * this._framesPerMS) % this._totalFrames;

            if (joint in this._keyframesByJoint) {
                //TODO: This is a naive approach.  Add memoization or pre-baking of keyframes in the future.
                var keyframes = this._keyframesByJoint[joint];
                var length = keyframes.length;

                for (var index = 0; index < (length - 1); ++index) {
                    if (keyframes[index].keyframe <= frame && keyframes[index + 1].keyframe > frame) {
                        var interpFactor = (frame - keyframes[index].keyframe) / (keyframes[index + 1].keyframe - keyframes[index].keyframe);

                        quat.slerp(this._quaternion, keyframes[index].rotation, keyframes[index + 1].rotation, interpFactor);
                        quat.invert(this._quaternion, this._quaternion);
                        return mat4.fromQuat(this._transform, this._quaternion);
                    }
                }
            }

            return this._identity;
        }

        private buildJointTags() {
            this._jointTags = {};
            this._jointTags["pelvis"] = 1;
            this._jointTags["back"] = 2;
            this._jointTags["neck"] = 3;
            this._jointTags["head"] = 4;
            this._jointTags["rtsternum"] = 5;
            this._jointTags["rtshoulder"] = 6;
            this._jointTags["rtelbow"] = 7;
            this._jointTags["rtwrist"] = 8;
            this._jointTags["rtfingers"] = 9;
            this._jointTags["lfsternum"] = 10;
            this._jointTags["lfshoulder"] = 11;
            this._jointTags["lfelbow"] = 12;
            this._jointTags["lfwrist"] = 13;
            this._jointTags["lffingers"] = 14;
            this._jointTags["rthip"] = 15;
            this._jointTags["rtknee"] = 16;
            this._jointTags["rtankle"] = 17;
            this._jointTags["rttoes"] = 18;
            this._jointTags["lfhip"] = 19;
            this._jointTags["lfknee"] = 20;
            this._jointTags["lfankle"] = 21;
            this._jointTags["lftoes"] = 22;
            this._jointTags["neck2"] = 23;
            this._jointTags["tail"] = 24;
            this._jointTags["tail2"] = 25;
            this._jointTags["tail3"] = 26;
            this._jointTags["tail4"] = 27;
            this._jointTags["obj1"] = 28;
            this._jointTags["obj2"] = 29;
            this._jointTags["obj3"] = 30;
            this._jointTags["hair"] = 31;
            this._jointTags["hair2"] = 32;
            this._jointTags["hair3"] = 33;
            this._jointTags["hair4"] = 34;
            this._jointTags["rtbreast"] = 35;
            this._jointTags["lfbreast"] = 36;
            this._jointTags["rteye"] = 37;
            this._jointTags["lfeye"] = 38;
            this._jointTags["lips"] = 39;
            this._jointTags["nose"] = 40;
            this._jointTags["rtear"] = 41;
            this._jointTags["lfear"] = 42;
        }
    }
}