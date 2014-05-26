using System.Collections.Generic;

namespace RWXViewer.Models
{
    public class World
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ObjectPath { get; set; }

        public virtual ICollection<ModelFile> Models
        {
            get;
            set;
        }
    }
}