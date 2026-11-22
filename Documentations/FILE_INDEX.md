# PROMPT HRMS — Documentations File Index

**Project:** PROMPT HRMS — UNIGLOBAL Suite  
**Client:** UniGlobal Consultancy Services W.L.L.  
**Prepared By:** SaNDS Lab Middle East W.L.L.  
**Last Updated:** 20 November 2026

| Doc ID | Title | HTML | PDF | Description |
| :--- | :--- | :--- | :--- | :--- |
| **DOC-IDX-000** | Documentation Portal Index | [index.html](./index.html) | — | Interactive HTML index for all technical & operational documents |
| **DOC-INFRA-001** | Server & SQL Server 2022 Installation Guide | [SQL_Server_Installation_Guide.html](./SQL_Server_Installation_Guide.html) | [SQL_Server_Installation_Guide.pdf](./SQL_Server_Installation_Guide.pdf) | AlmaLinux 8.10 setup, required/verified software versions, SQL Server 2022 RAM cap, ASP.NET Core 8.0 Runtime, Apache proxy, Git pull & backups |
| **DOC-DB-002** | SQL Server SSMS Connection Procedure | [SQL_Server_SSMS_Connection_Guide.html](./SQL_Server_SSMS_Connection_Guide.html) | [SQL_Server_SSMS_Connection_Guide.pdf](./SQL_Server_SSMS_Connection_Guide.pdf) | Verified SSMS connection via encrypted SSH tunnel (`127.0.0.1,14330`), WHM CLI access, & Error 1225 troubleshooting |
| **DOC-ARCH-003** | Linux Web Server & Hosting Architecture | [Linux_WebServer_Architecture.html](./Linux_WebServer_Architecture.html) | [Linux_WebServer_Architecture.pdf](./Linux_WebServer_Architecture.pdf) | Request flow (`Nginx` → `Apache` → `.NET 8 Kestrel` → `SQL Server 2022`), port isolation matrix & zero-downtime update commands |
| **DOC-DEV-004** | Developer Workflow, Milestones & Defect Manual | [HRMS_Module_Developer_Workflow_and_Milestones_Guide.html](./HRMS_Module_Developer_Workflow_and_Milestones_Guide.html) | [HRMS_Module_Developer_Workflow_and_Milestones_Guide.pdf](./HRMS_Module_Developer_Workflow_and_Milestones_Guide.pdf) | Software engineering manual, 6-milestone delivery gates (22 wks), Clean Architecture directory tree, 92 requirements traceability, GitFlow, Defect SLAs (P1–P4), 6-stage bug lifecycle & customer complaint workflows (strictly non-commercial, zero pricing) |
| **DOC-SLA-005** | HRMS Service Level Agreement & Milestones | [HRMS_Module_Service_Level_Agreement_SaNDS_Lab_UniGlobal.html](./HRMS_Module_Service_Level_Agreement_SaNDS_Lab_UniGlobal.html) | [HRMS_Module_Service_Level_Agreement_SaNDS_Lab_UniGlobal.pdf](./HRMS_Module_Service_Level_Agreement_SaNDS_Lab_UniGlobal.pdf) | Bilateral SLA establishing 6 development milestones (M1–M6), progress billing, review SLAs, 4-tier defect matrix, 60-day warranty, 99.5% uptime operational boundaries, full source code handover, and Annexure 1 |
| **DOC-CLAR-006** | HRMS Technical Clarifications Response | [HRMS_Module_Technical_Clarifications_Response_SaNDS_Lab.html](./HRMS_Module_Technical_Clarifications_Response_SaNDS_Lab.html) | [HRMS_Module_Technical_Clarifications_Response_SaNDS_Lab.pdf](./HRMS_Module_Technical_Clarifications_Response_SaNDS_Lab.pdf) | Executive response addressing 10 client architectural inquiries: ERP merge via 100% source code & REST APIs, SQL Server 2022/2019+ DB migration, tokenized CSS theme engine, ad-hoc reports & Clean Architecture |

---

### Related Root Planning Files
- [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md)
- [SERVER_INSTALLATION_PROCEDURE.md](../SERVER_INSTALLATION_PROCEDURE.md)
- [SQL_SERVER_CONNECTION_GUIDE.md](../SQL_SERVER_CONNECTION_GUIDE.md)
