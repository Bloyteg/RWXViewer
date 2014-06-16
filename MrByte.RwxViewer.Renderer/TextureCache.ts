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
    export enum TextureFilteringMode {
        None,
        MipMap
    }

    export module TextureCache {
        var imageCache = {};
        var textureCache = {};

        var emptyTexture: Texture = null;

        export function addImageToCache(name: string, image: HTMLImageElement) {
            if (!(name in imageCache)) {
                imageCache[name] = image;
            }
        }

        export function getTexture(gl: WebGLRenderingContext, name: string, filteringMode: TextureFilteringMode): Texture {
            if (emptyTexture === null) {
                emptyTexture = new EmptyTexture(gl);
            }

            if (!name) {
                return emptyTexture;
            }

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
                if (imageSource.width < imageSource.height && imageSource.height % imageSource.width === 0) {
                    //TODO: Handle animated textures.
                    return emptyTexture;
                } else {
                    return new StaticTexture(gl, imageSource, TextureFactory.getFactory(gl, filteringMode));
                }
            }

            return emptyTexture;
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