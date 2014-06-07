using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace RWXViewer.Models.DAL
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