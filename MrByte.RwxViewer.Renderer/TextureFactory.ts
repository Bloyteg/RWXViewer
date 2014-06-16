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
    export module TextureFactory {
        export function getFactory(gl: WebGLRenderingContext, filteringMode: TextureFilteringMode): TextureFactory {
            switch (filteringMode) {
                case TextureFilteringMode.MipMap:
                    return new MipMapTextureFactory(gl);
                default:
                    return new UnfilteredTextureFactory(gl);
            }
        }
    }

    export interface TextureFactory {
        getTexture(source: HTMLCanvasElement): WebGLTexture
        getTexture(source: HTMLImageElement): WebGLTexture
        updateTexture(texture: WebGLTexture, source: HTMLCanvasElement);
    }

    class MipMapTextureFactory implements TextureFactory {
        private _gl: WebGLRenderingContext;
        private _anisotropicFilterExt;

        constructor(gl: WebGLRenderingContext) {
            this._gl = gl;
        }

        getTexture(source: HTMLCanvasElement): WebGLTexture
        getTexture(source: HTMLImageElement): WebGLTexture
        getTexture(source: any) {
            var gl = this._gl;
            var texture = gl.createTexture();

            this.fillTexture(texture, source);

            return texture;
        }

        updateTexture(texture: WebGLTexture, source: HTMLCanvasElement) {
            this.fillTexture(texture, source);
        }

        private fillTexture(texture: WebGLTexture, source: HTMLCanvasElement)
        private fillTexture(texture: WebGLTexture, source: HTMLImageElement)
        private fillTexture(texture: WebGLTexture, source: any) {
            var gl = this._gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);

            if (this._anisotropicFilterExt) {
                var maxAnisotropy = gl.getParameter(this._anisotropicFilterExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
                gl.texParameterf(gl.TEXTURE_2D, this._anisotropicFilterExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
            }

            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    class UnfilteredTextureFactory implements TextureFactory {
        private _gl: WebGLRenderingContext;

        constructor(gl: WebGLRenderingContext) {
            this._gl = gl;
        }

        getTexture(source: HTMLCanvasElement): WebGLTexture
        getTexture(source: HTMLImageElement): WebGLTexture
        getTexture(source: any) {
            var gl = this._gl;
            var texture = gl.createTexture();

            this.fillTexture(texture, source);

            return texture;
        }

        updateTexture(texture: WebGLTexture, source: HTMLCanvasElement) {
            this.fillTexture(texture, source);
        }

        private fillTexture(texture: WebGLTexture, source: HTMLCanvasElement)
        private fillTexture(texture: WebGLTexture, source: HTMLImageElement)
        private fillTexture(texture: WebGLTexture, source: any) {
            var gl = this._gl;

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
} 