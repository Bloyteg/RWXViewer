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
    export interface Texture {
        bind(slot: number, sampler: number);
        update(frameCount: number);
    }

    export enum TextureFilteringMode {
        None,
        MipMap
    }

    class StaticTexture implements Texture {
        private _gl: WebGLRenderingContext;
        private _texture: WebGLTexture;

        constructor(gl: WebGLRenderingContext, imageSource: HTMLImageElement) {

        }

        bind(slot: number, sampler: number) {
            var slotName = "TEXTURE" + slot;
            var gl = this._gl;

            gl.activeTexture(gl[slotName]);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.uniform1i(sampler, slot);
        }

        update(frameCount: number) {
            //No op on a static texture.
        }
    }

    export module TextureCache {
        var imageCache = {};
        var textureCache = {};

        export function addImageToCache(name: string, image: HTMLImageElement) {
            if (!(name in imageCache)) {
                imageCache[name] = image;
            }
        }

        export function getTexture(gl: WebGLRenderingContext, name: string, filteringMode: TextureFilteringMode): Texture {
            var textureCacheKey = buildCacheKey(name, filteringMode);
            var texture = getFromCache(textureCacheKey);

            if (texture) {
                return texture;
            }

            texture = createTexture(gl, imageCache[name], filteringMode);

            if (texture) {
                addToCache(textureCacheKey, texture);
            }

            return texture;
        }

        function createTexture(gl: WebGLRenderingContext, imageSource: HTMLImageElement, filteringMode: TextureFilteringMode) {
            if (imageSource) {

            }

            return null;
        }

        function buildCacheKey(name: string, filteringMode: TextureFilteringMode) {
            if (filteringMode === TextureFilteringMode.None) {
                return "not-filtered-" + name;
            } else {
                return "filtered-" + name;
            }
        }

        function getFromCache(name: string) {
            if (name in textureCache) {
                return textureCache[name];
            }

            return null;
        }

        function addToCache(name: string, texture: Texture) {
            if (!(name in textureCache)) {
                textureCache[name] = texture;
            }
        }
    }
}


//buildTextureFromImage(image: HTMLImageElement, anistropyExt): WebGLTexture {
//    var gl = this._gl;
//    var texture = gl.getTextureWithMipMaps();

//    gl.bindTexture(gl.TEXTURE_2D, texture);
//    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
//    gl.generateMipmap(gl.TEXTURE_2D);

//    if (anistropyExt) {
//        var maxAnisotropy = gl.getParameter(anistropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
//        gl.texParameterf(gl.TEXTURE_2D, anistropyExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
//    }

//    gl.bindTexture(gl.TEXTURE_2D, null);

//    return texture;
//}

//        private buildTextureCache(textures: IImageCollection): ITextureCache {
//    var result: ITextureCache = {};

//    var keys = Object.keys(textures);
//    var length = keys.length;
//    var anistropicFiltering = this._gl.getExtension("EXT_texture_filter_anisotropic")
//        || this._gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")
//        || this._gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

//    for (var index = 0; index < length; ++index) {
//        var key = keys[index];

//        //   result[key] = this.buildTextureFromImage(textures[key], anistropicFiltering);
//    }

//    return result;
//}