using System.Data.Entity;

namespace RWXViewer.Models
{
    public class ModelContext : DbContext
    {
        public ModelContext() : base("ModelContext")
        {
            
        }

        public DbSet<World> Worlds { get; set; }
        public DbSet<ModelFile> ModelFiles { get; set; }
    }
}