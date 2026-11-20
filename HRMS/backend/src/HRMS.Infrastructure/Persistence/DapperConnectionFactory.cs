using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace HRMS.Infrastructure.Persistence;

public interface IDapperConnectionFactory
{
    IDbConnection CreateConnection();
}

public class DapperConnectionFactory : IDapperConnectionFactory
{
    private readonly string _connectionString;

    public DapperConnectionFactory(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is missing in appsettings.json");
    }

    public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
}
