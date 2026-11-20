# PROMPT HRMS — Server Installation & Connection Procedure

**Target Server OS:** AlmaLinux v8.10 (RHEL 8 compatible, cPanel/WHM with existing MySQL/MariaDB & Apache)  
**Domain:** `https://prompthrms.sandslab.com` (cPanel user: `prompthrms`)  
**Application Stack:** ReactJS + ASP.NET Core 8.0 Web API (EF Core + Dapper) + SQL Server 2022  
**Isolation Guarantee:** Runs on separate ports (`1433` SQL Server, `127.0.0.1:5050` HRMS API) and separate directories (`/var/opt/mssql`, `/opt/prompt-hrms`) — zero impact on existing MySQL (`3306`), PHP, or other cPanel domains.

---

## 0. Required & Verified Software Versions

| Component | Minimum Required | Verified on Server (`earth`) | Verified on Dev PC (Ajit) | Required On |
| :--- | :--- | :--- | :--- | :--- |
| **SQL Server** | **SQL Server 2022 (16.x)** or higher | `16.0.4325.4` (2022 CU28 Developer, Linux X64) | `16.0.1000.6` (2022 Express, `.\SQLEXPRESS`) | Server & Dev PC |
| **SQL CLI / Driver** | `ODBC Driver 18` / `sqlcmd 17+` | `mssql-tools18` | `Sqlcmd 17.0.925.4` / `ODBC 18` | Server & Dev PC |
| **.NET Runtime** | **ASP.NET Core 8.0 Runtime (LTS)** *(or Hosting Bundle on IIS)* | `Microsoft.AspNetCore.App 8.0.34` | `8.0.34` | **Production Server** |
| **.NET SDK** | **.NET 8.0 SDK (LTS)** | *Not needed on server* | `8.0.428` *(+ `10.0.404`)* | **Dev PCs Only (Ajit & Ancy)** |
| **Node.js & npm** | **Node.js 20 LTS+** / `npm 10+` | *Not needed on server* | Node `v26.13.0` / npm `11.20.0` | **Dev PCs Only** |
| **Git** | **Git 2.40+** | Installed (`git pull`) | `2.53.0.windows.2` | Server & Dev PC |

> **Notes:**
> - Old Windows **.NET Framework 4.x** is **NOT** required.
> - **SQL Server Licensing:** Developer Edition is free for Dev/Staging/UAT; for live Production go-live, use **SQL Server 2022 Express** (free up to 10 GB) or licensed **Standard / Enterprise**.

---

## 1. Pre-Flight Safety Check
```bash
free -h
df -h /
ss -tulpn | grep -E ':1433|:5050' || echo "Ports 1433 and 5050 are FREE"
```

---

## 2. Install SQL Server 2022 (Separate from MySQL)
```bash
curl -o /etc/yum.repos.d/mssql-server.repo https://packages.microsoft.com/config/rhel/8/mssql-server-2022.repo
dnf install -y mssql-server
/opt/mssql/bin/mssql-conf setup
```
- Select Edition (`2` = Developer for Dev/UAT, `3` = Express, or licensed Standard/Enterprise for Production).
- Set a strong `SA` password.

### Cap SQL Server RAM (Protects MySQL & Existing Sites)
```bash
/opt/mssql/bin/mssql-conf set memory.memorylimitmb 4096
systemctl enable --now mssql-server
systemctl restart mssql-server
systemctl status mssql-server --no-pager
```

---

## 3. Install `sqlcmd` Tools & Create `UniGlobalHRMS` Database
```bash
curl -o /etc/yum.repos.d/msprod.repo https://packages.microsoft.com/config/rhel/8/prod.repo
ACCEPT_EULA=Y dnf install -y mssql-tools18 unixODBC-devel
echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc
source ~/.bashrc
```

Create database & application user:
```bash
sqlcmd -S localhost -U sa -C -Q "
CREATE DATABASE UniGlobalHRMS;
GO
CREATE LOGIN UniGlobalHRUser WITH PASSWORD = 'YourStrongPasswordHere';
USE UniGlobalHRMS;
CREATE USER UniGlobalHRUser FOR LOGIN UniGlobalHRUser;
ALTER ROLE db_owner ADD MEMBER UniGlobalHRUser;
GO"
```

---

## 4. Install ASP.NET Core 8.0 Runtime
*(Node.js and the .NET SDK are NOT required on the production server.)*
```bash
dnf install -y aspnetcore-runtime-8.0
dotnet --list-runtimes
```

### Verify Full Stack Health
```bash
systemctl is-active mssql-server mysqld mariadb 2>/dev/null
dotnet --list-runtimes
sqlcmd -S localhost -U UniGlobalHRUser -C -d UniGlobalHRMS -Q "SELECT DB_NAME() AS CurrentDB, @@VERSION AS Version"
```

---

## 5. Prepare Isolated App Folder & `systemd` Service
```bash
mkdir -p /opt/prompt-hrms/uploads /opt/prompt-hrms/logs
useradd -r -s /sbin/nologin prompthrms 2>/dev/null || true
chown -R prompthrms:prompthrms /opt/prompt-hrms
```

Create `/etc/systemd/system/prompt-hrms.service`:
```ini
[Unit]
Description=PROMPT HRMS (.NET 8 API + React SPA)
After=network.target mssql-server.service

[Service]
WorkingDirectory=/opt/prompt-hrms
ExecStart=/usr/bin/dotnet /opt/prompt-hrms/HRMS.API.dll
Restart=always
RestartSec=10
User=prompthrms
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5050

[Install]
WantedBy=multi-user.target
```

After uploading published files to `/opt/prompt-hrms`:
```bash
systemctl daemon-reload
systemctl enable --now prompt-hrms
systemctl status prompt-hrms --no-pager
```

---

## 6. Configure cPanel / Apache Reverse Proxy (Subdomain Only)
*(Do NOT install Nginx — use cPanel's existing Apache so other domains remain untouched.)*

1. In **cPanel → Domains**, create a dedicated subdomain (e.g. `hrms.yourdomain.com`) and enable **AutoSSL**.
2. Create an Apache include **only** for that subdomain (replace `<cpanel_user>` and `hrms.yourdomain.com`):
   ```bash
   mkdir -p /etc/apache2/conf.d/userdata/ssl/2_4/<cpanel_user>/hrms.yourdomain.com
   ```
3. Create `/etc/apache2/conf.d/userdata/ssl/2_4/<cpanel_user>/hrms.yourdomain.com/hrms_proxy.conf`:
   ```apache
   ProxyPreserveHost On
   ProxyPass / http://127.0.0.1:5050/
   ProxyPassReverse / http://127.0.0.1:5050/
   RequestHeader set X-Forwarded-Proto "https"
   ```
4. Rebuild & gracefully reload Apache:
   ```bash
   /usr/local/cpanel/scripts/rebuildhttpdconf
   /usr/local/cpanel/scripts/restartsrv_httpd
   ```

---

## 7. How to Connect to SQL Server on `earth` from Your Windows PC

### Option A — SSMS via SSH Tunnel *(Verified & Recommended — Most Secure, Port 1433 Stays Closed)*
1. On your Windows PC, open **PowerShell** and start an encrypted SSH tunnel (keep this window open while using SSMS):
   ```powershell
   ssh -L 127.0.0.1:14330:127.0.0.1:1433 root@<server-ip>
   ```
   *(Using local port `14330` avoids conflicting with your local Windows SQL Server on `1433`.)*
2. Open **SQL Server Management Studio (SSMS)**:
   - **Server name:** `127.0.0.1,14330` *(Important: use `127.0.0.1,14330`, not `localhost,14330`, to avoid Windows IPv6 `::1` Error 1225)*
   - **Authentication:** `SQL Server Authentication`
   - **Login:** `UniGlobalHRUser`
   - **Password:** *(your password)*
   - **Encrypt:** `Mandatory` + Check **Trust Server Certificate** → Click **Connect**.

### Option B — Direct IP Connection *(Only If Needed — Whitelist Your IP Only)*
1. In **WHM → Plugins → ConfigServer Security & Firewall (CSF)**, open **Firewall Allow IPs (`csf.allow`)** and add **only** your office/home static IP for TCP port `1433`:
   ```text
   tcp|in|d=1433|s=<YOUR_OFFICE_IP>
   ```
   Restart CSF (`csf -r`). *(Never open port `1433` to the entire internet.)*
2. In **SSMS**:
   - **Server name:** `<your-server-ip>,1433`
   - **Authentication:** `SQL Server Authentication` (`UniGlobalHRUser`)
   - Check **Trust server certificate** → Click **Connect**.

### Option C — Direct Browser Terminal (WHM / cPanel)
Open **WHM → Terminal** and run:
```bash
sqlcmd -S localhost -U UniGlobalHRUser -C -d UniGlobalHRMS
```

---

## 8. Daily Automated Backup (Cron Example)
Create `/var/opt/mssql/backups` and schedule a nightly 02:00 AM compressed backup:
```bash
mkdir -p /var/opt/mssql/backups
chown mssql:mssql /var/opt/mssql/backups
```
Manual / Cron backup command:
```bash
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P '<SA_PASSWORD>' -C -Q \
"BACKUP DATABASE [UniGlobalHRMS] TO DISK = N'/var/opt/mssql/backups/UniGlobalHRMS_$(date +%F).bak' WITH COMPRESSION, STATS = 10"
```

---

## 9. Quick Frontend Deployment via Git (`prompthrms` cPanel User)
Logged in as `prompthrms@earth`:
```bash
# First time clone:
git clone https://github.com/ajitsands/UniGlobalHRMS.git ~/repo
cp -r ~/repo/HRMS/frontend/dist/. ~/public_html/

# Subsequent updates:
cd ~/repo && git pull origin main && cp -r ~/repo/HRMS/frontend/dist/. ~/public_html/
```

