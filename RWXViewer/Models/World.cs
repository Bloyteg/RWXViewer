using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RWXViewer.Models
{
    public class World
    {
        [Key]
        public int WorldId { get; set; }
        public string Name { get; set; }
        public string ObjectPathUrl { get; set; }

        public virtual ICollection<ObjectPathItem> Models
        {
            get;
            set;
        }
    }
}