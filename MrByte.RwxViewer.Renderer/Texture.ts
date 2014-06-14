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
    export interface ITexture {
        bind(slot: number);
        update(frameCount: number);
    }

   

    function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
        
    }

    function createMask(gl: WebGLRenderingContext, image: HTMLImageElement) {
        
    }
} 