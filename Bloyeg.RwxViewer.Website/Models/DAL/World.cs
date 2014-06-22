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
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Bloyeg.RwxViewer.Website.Models.DAL
{
    [DataContract]
    public class World
    {
        [Key]
        [JsonProperty(PropertyName = "worldId")]
        public int WorldId { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "objectPathUrl")]
        public string ObjectPathUrl { get; set; }

        [JsonIgnore]
        public virtual ICollection<Model> Models { get; set; }

        [JsonIgnore]
        public virtual ICollection<Texture> Textures { get; set; }
    }
}