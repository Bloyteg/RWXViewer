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
    export class StaticTexture implements Texture {
        private _gl: WebGLRenderingContext;
        private _texture: WebGLTexture;

        constructor(gl: WebGLRenderingContext, imageSource: HTMLImageElement, textureFactory: TextureFactory) {
            this._gl = gl;
            this._texture = textureFactory.getTexture(imageSource);
        }

        bind(slot: number, sampler: WebGLUniformLocation) {
            var slotName = "TEXTURE" + slot;
            var gl = this._gl;

            gl.activeTexture(gl[slotName]);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.uniform1i(sampler, slot);
        }

        update(frameCount: number) {
            //No op on a static texture.
        }

        get isEmpty() { return false; }
    }
}