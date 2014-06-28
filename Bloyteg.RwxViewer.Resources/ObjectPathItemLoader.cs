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

using System.Data.Entity;
using System.Threading.Tasks;
using Bloyteg.RwxViewer.Resources.DAL;
using Animation = Bloyteg.AW.Animation.Seq.Animation;
using Model = MrByte.RWX.Model.Model;


namespace Bloyteg.RwxViewer.Resources
{
    public class ObjectPathItemLoader : IObjectPathItemLoader
    {
        private readonly IResourceLocator<DAL.Model, Model> _modelLocator;
        private readonly IResourceLocator<Texture, byte[]> _textureLocator;
        private readonly IResourceLocator<DAL.Animation, Animation> _animationLocator;

        public ObjectPathItemLoader(IResourceLocator<DAL.Model, Model> modelLocator,
                                    IResourceLocator<Texture, byte[]> textureLocator,
                                    IResourceLocator<DAL.Animation, Animation> animationLocator)
        {
            _textureLocator = textureLocator;
            _modelLocator = modelLocator;
            _animationLocator = animationLocator;
        }

        public async Task<Model> GetModelAsync(int worldId, string modelName)
        {
            using (var context = new ObjectPathContext())
            {
                return await _modelLocator.GetResourceAsync(await context.Models.SingleOrDefaultAsync(entity => entity.WorldId == worldId && entity.Name == modelName));
            }
        }

        public async Task<byte[]> GetTextureAsync(int worldId, string textureName)
        {
            using (var context = new ObjectPathContext())
            {
                return await _textureLocator.GetResourceAsync(await context.Textures.SingleOrDefaultAsync(entity => entity.WorldId == worldId && entity.Name == textureName));
            }
        }

        public async Task<Animation> GetAnimationAsync(int worldId, string animationName)
        {
            using (var context = new ObjectPathContext())
            {
                return await _animationLocator.GetResourceAsync(await context.Animations.SingleOrDefaultAsync(entity => entity.WorldId == worldId && entity.Name == animationName));
            }
        }
    }
}