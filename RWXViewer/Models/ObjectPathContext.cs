using System.Data.Entity;

namespace RWXViewer.Models
{
    public class ObjectPathContext : DbContext
    {
        public ObjectPathContext() : base("ObjectPathContext")
        {
            
        }

        public DbSet<World> Worlds { get; set; }
        public DbSet<ObjectPathItem> ObjectPathItem { get; set; }
    }
}