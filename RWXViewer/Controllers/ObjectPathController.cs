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

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using RWXViewer.Models;
using RWXViewer.Models.DAL;

namespace RWXViewer.Controllers
{
    public class ObjectPathController : ApiController
    {
        private readonly IObjectPathItemLoader _objectPathItemLoader;

        public ObjectPathController(IObjectPathItemLoader objectPathItemLoader)
        {
            _objectPathItemLoader = objectPathItemLoader;
        }

        [Route("api/ObjectPath/Worlds")]
        public IEnumerable<World> GetWorlds()
        {
            using (var context = new ObjectPathContext())
            {
                return context.Worlds.ToList();
            }
        }

        [Route("api/ObjectPath/Worlds/{id}/Models")]
        public async Task<IEnumerable<Model>> GetWorldModels(int id)
        {
            using (var context = new ObjectPathContext())
            {
                var world = await context.Worlds.FindAsync(id);
                return world != null
                    ? world.Models.Where(item => item.Type == ModelType.Model || item.Type == ModelType.Avatar).ToList()
                    : Enumerable.Empty<Model>();
            }
        }

        [Route("api/ObjectPath/Worlds/{id}/Models/{modelName}")]
        public async Task<IHttpActionResult> Get(int id, string modelName)
        {
            var model = await _objectPathItemLoader.GetModelAsync(id, modelName);
            return model == null ? (IHttpActionResult)NotFound() : Ok(model);
        }
    }
}
