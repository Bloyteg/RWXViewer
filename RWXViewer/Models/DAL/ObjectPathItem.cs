using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace RWXViewer.Models.DAL
{
    public class ObjectPathItem
    {
        [Key, Column(Order = 0)]
        [JsonProperty(PropertyName = "worldId")]
        public int WorldId { get; set; }

        [Key, Column(Order = 1)]
        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "fileName")]
        public string FileName { get; set; }

        [ForeignKey("WorldId")]
        [JsonIgnore]
        public virtual World World { get; set; }
    }
}