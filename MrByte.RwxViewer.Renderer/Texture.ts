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
        bind(slot: number);
        update(frameCount: number);
    }

    interface ITextureCache {
        [name: string]: Texture;
    }

    export function createTexture(gl: WebGLRenderingContext, name: string): Texture {
        return null;
    }

    export function createMask(gl: WebGLRenderingContext, name: string): Texture {
        return null;
    }
} 

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