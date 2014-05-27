using System.ComponentModel.DataAnnotations;

namespace RWXViewer.Models
{
    public enum ObjectPathItemType
    {
        Model,
        Avatar,
        Texture
    }

    public class ObjectPathItem
    {
        [Key]
        public int PathObjectId { get; set; }
        public string Name { get; set; }
        public ObjectPathItemType Type { get; set; }
        public string FileName { get; set; }
        public virtual World World { get; set; }
    }
}