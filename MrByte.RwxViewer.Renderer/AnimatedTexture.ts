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
    export class AnimatedTexture implements Texture {
        private _gl: WebGLRenderingContext;
        private _texture: WebGLTexture;
        private _imageSource: HTMLImageElement;
        private _canvas: HTMLCanvasElement;
        private _currentFrame: number;
        private _totalFrames: number;
        private _textureFactory: TextureFactory;
        private _lastUpdate: number;
        
        constructor(gl: WebGLRenderingContext, imageSource: HTMLImageElement, textureFactory: TextureFactory) {
            this._gl = gl;
            this._imageSource = imageSource;

            this._canvas = document.createElement("canvas");
            this._canvas.width = imageSource.width;
            this._canvas.height = imageSource.width;

            this._currentFrame = 0;
            this._totalFrames = this._imageSource.height / this._imageSource.width;

            this._textureFactory = textureFactory;
            this._texture = textureFactory.getTexture(<any>this.getNextFrame());

            this._lastUpdate = null;
        }

        private getNextFrame(): HTMLCanvasElement {
            var canvas = this._canvas;

            var offsetY = canvas.width * (this._currentFrame % this._totalFrames);
            var dimension = canvas.width;

            var context = canvas.getContext("2d");
            context.clearRect(0, 0, dimension, dimension);
            context.drawImage(this._imageSource, 0, offsetY, dimension, dimension, 0, 0, dimension, dimension);

            return canvas;
        }

        bind(slot: number, sampler: WebGLUniformLocation) {
            var slotName = "TEXTURE" + slot;
            var gl = this._gl;

            gl.activeTexture(gl[slotName]);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.uniform1i(sampler, slot);
        }

        update(update: number) {
            if (this._lastUpdate === null || (update - this._lastUpdate) >= 160) {
                this._textureFactory.updateTexture(this._texture, this.getNextFrame());
                this._currentFrame++;
                this._lastUpdate = update;
            }
        }

        get isEmpty() { return false; }
    }
} 