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

namespace Bloyteg.RwxViewer.Resources.DAL
{
    public class ObjectPathContext : DbContext
    {
        public ObjectPathContext() : base("ObjectPathDb")
        {
        }

        public DbSet<World> Worlds { get; set; }
        public DbSet<Model> Models { get; set; }
        public DbSet<Texture> Textures { get; set; }
        public DbSet<Animation> Animations { get; set; }
    }
}