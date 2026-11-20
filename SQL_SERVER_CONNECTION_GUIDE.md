# PROMPT HRMS — Remote SQL Server Connection Guide (SSMS via SSH Tunnel)

**Verified Target:** `SQL Server 2022 (16.0.4325.4)` on AlmaLinux 8.10 (`earth`)  
**Database:** `UniGlobalHRMS`  
**Login:** `UniGlobalHRUser`  
**Security Policy:** TCP port `1433` remains **closed to the public internet**; all remote SSMS administration uses an encrypted SSH tunnel.

---

## Step 1 — Open the Encrypted SSH Tunnel (Windows PowerShell)
Open **PowerShell** on your Windows PC and run (keep this window open while working in SSMS):

```powershell
ssh -L 127.0.0.1:14330:127.0.0.1:1433 root@185.252.176.129
```

- Enter the server `root` password when prompted.
- Once `[root@earth ~]#` appears, the tunnel is active.
- *(Using local port `14330` prevents any conflict with your local Windows `SQLEXPRESS` instance on port `1433`.)*

---

## Step 2 — Connect in SQL Server Management Studio (SSMS)
Open **SSMS** and enter these exact connection settings:

| Field | Value |
| :--- | :--- |
| **Server Name** | `127.0.0.1,14330` |
| **Authentication** | `SQL Server Authentication` |
| **User Name** | `UniGlobalHRUser` |
| **Password** | *(Configured SQL Server password)* |
| **Database Name** | `<default>` or `UniGlobalHRMS` |
| **Encrypt** | `Mandatory` |
| **Trust Server Certificate** | **Checked (`✓`)** |

Click **Connect**. You will see `127.0.0.1,14330 (SQL Server 16.0.4325.4 - UniGlobalHRUser)` → `Databases` → **`UniGlobalHRMS`**.

---

## Troubleshooting Notes
- **Error 1225 (`The remote computer refused the network connection`):**
  1. Ensure **Server Name** is **`127.0.0.1,14330`** (NOT `localhost,14330`, which resolves to IPv6 `::1` on Windows).
  2. Confirm the PowerShell SSH tunnel window is still open and logged in.
  3. On the server, verify SSH TCP forwarding is allowed:
     ```bash
     sshd -T | grep allowtcpforwarding
     ```
     *(Must be `allowtcpforwarding yes`.)*
- **Disconnecting:** Close SSMS, then type `exit` in the PowerShell SSH window to close the tunnel cleanly.
