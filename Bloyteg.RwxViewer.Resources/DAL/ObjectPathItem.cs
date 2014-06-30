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
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Bloyteg.RwxViewer.Resources.DAL
{
    public class ObjectPathItem
    {
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [Index("IX_WorldAndName", IsUnique = true, Order = 1)]
        [JsonProperty(PropertyName = "worldId")]
        public int WorldId { get; set; }

        [Index("IX_WorldAndName", IsUnique = true, Order = 2)]
        [MaxLength(32)]
        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [MaxLength(32)]
        [JsonProperty(PropertyName = "fileName")]
        public string FileName { get; set; }

        [ForeignKey("WorldId")]
        [JsonIgnore]
        public virtual World World { get; set; }
    }
}