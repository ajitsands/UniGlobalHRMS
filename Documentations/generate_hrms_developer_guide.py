import os
import subprocess
import pypdf
import fitz
import base64

# Load SaNDS logo base64
with open('Logos/logo_base64.txt', 'r', encoding='utf-8') as f:
    logo_b64 = f.read().strip()
img_data_uri = f'data:image/png;base64,{logo_b64}'

# Load UniGlobal logo base64
uniglobal_b64 = ''
if os.path.exists('Logos/UNIGLOBAL_CONSULTANCY_LOGO_FINAL.png'):
    with open('Logos/UNIGLOBAL_CONSULTANCY_LOGO_FINAL.png', 'rb') as f:
        uniglobal_b64 = f'data:image/png;base64,{base64.b64encode(f.read()).decode("utf-8")}'

ref = 'SL-DOC-HRMS-DEV-2026-V1'
master_sla_ref = 'SL-SLA-HRMS-2026-V1'
clar_ref = 'SL-RESP-HRMS-CLAR-2026-V1'
date_str = '22 November 2026'

html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PROMPT HRMS &amp; Mobile App &bull; Developer Workflow, Milestones &amp; Defect Manual</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {{
      --primary: #0a2540;
      --primary-light: #1e3e62;
      --primary-dark: #07192c;
      --accent: #d97706;
      --accent-hover: #b45309;
      --navy: #0f172a;
      --slate-900: #0f172a;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-500: #64748b;
      --slate-400: #94a3b8;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50: #f8fafc;
      --emerald-600: #059669;
      --emerald-500: #10b981;
      --emerald-50: #ecfdf5;
      --blue-600: #0284c7;
      --blue-500: #0ea5e9;
      --blue-50: #f0f9ff;
      --rose-600: #e11d48;
      --rose-50: #fff1f2;
      --amber-600: #d97706;
      --amber-50: #fffbeb;
      --purple-600: #7c3aed;
      --purple-50: #f5f3ff;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f1f5f9;
      color: var(--slate-700);
      font-size: 11px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }}

    table.document-print-wrapper {{
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
      border: none;
    }}

    table.document-print-wrapper > thead > tr > td,
    table.document-print-wrapper > tfoot > tr > td,
    table.document-print-wrapper > tbody > tr > td {{
      padding: 0;
      border: none;
      background: transparent !important;
    }}

    table.document-print-wrapper > thead {{
      display: table-header-group;
    }}

    table.document-print-wrapper > tfoot {{
      display: table-footer-group;
    }}

    .running-header-strip {{
      width: 100%;
      padding: 0 4px 6px 4px;
      margin-bottom: 8px;
      border-bottom: 1.5px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #64748b;
      font-family: 'Inter', -apple-system, sans-serif;
    }}

    .running-header-strip .brand {{
      font-weight: 700;
      color: #0a2540;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }}

    .running-header-strip .ref-id {{
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #b45309;
      background: #fffbeb;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #fde68a;
    }}

    .running-footer-strip {{
      width: 100%;
      padding: 6px 4px 0 4px;
      margin-top: 8px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.8pt;
      color: #64748b;
      font-family: 'Inter', -apple-system, sans-serif;
    }}

    .running-footer-strip .confidential {{
      font-weight: 600;
      color: #0a2540;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }}

    .running-sep {{
      margin: 0 6px;
      color: #cbd5e1;
    }}

    .page-container {{
      max-width: 980px;
      margin: 18px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(10, 37, 64, 0.08);
      overflow: hidden;
      padding: 24px 34px;
      border: 1px solid var(--slate-200);
    }}

    .nav-bar-cluster {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }}

    .nav-pill-btn {{
      background: #ffffff;
      border: 1px solid var(--slate-200);
      color: var(--slate-700);
      text-decoration: none;
      font-size: 11px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }}

    .nav-pill-btn:hover {{
      background: var(--slate-50);
      border-color: var(--primary);
      color: var(--primary);
    }}

    .nav-pill-btn.btn-primary {{
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(10, 37, 64, 0.2);
    }}

    .nav-pill-btn.btn-primary:hover {{
      background: var(--accent);
      border-color: var(--accent);
      color: #ffffff;
    }}

    .floating-pdf-btn {{
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--primary);
      color: #ffffff;
      padding: 11px 22px;
      border-radius: 30px;
      box-shadow: 0 4px 20px rgba(10, 37, 64, 0.3);
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 9999;
      border: 2px solid #ffffff;
      transition: all 0.2s ease;
    }}

    .floating-pdf-btn:hover {{
      background: var(--accent);
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(217, 119, 6, 0.4);
    }}

    .letterhead-banner {{
      background: linear-gradient(135deg, #07192c 0%, #0a2540 60%, #1e3e62 100%);
      color: #ffffff;
      padding: 22px 26px;
      border-radius: 8px;
      margin-bottom: 16px;
      position: relative;
      border-bottom: 4px solid var(--accent);
    }}

    .letterhead-top {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      gap: 15px;
    }}

    .logos-cluster {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .logo-box {{
      background: #ffffff;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    }}

    .logo-box img {{
      height: 28px;
      width: auto;
      display: block;
    }}

    .logo-sep {{
      height: 24px;
      width: 1px;
      background: rgba(255, 255, 255, 0.25);
    }}

    .letter-ref-badge {{
      background: rgba(217, 119, 6, 0.2);
      border: 1px solid #f59e0b;
      color: #fde68a;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 14px;
      letter-spacing: 0.5px;
    }}

    /* Title Block */
    .title-block {{
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 8px;
      margin-bottom: 22px;
      position: relative;
    }}

    .title-badge-row {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }}

    .badge-pill {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }}

    .pill-accent {{ background: rgba(217, 119, 6, 0.2); color: #fde68a; border: 1px solid rgba(217, 119, 6, 0.4); }}
    .pill-emerald {{ background: rgba(5, 150, 105, 0.2); color: #a7f3d0; border: 1px solid rgba(5, 150, 105, 0.4); }}
    .pill-blue {{ background: rgba(2, 132, 199, 0.2); color: #bae6fd; border: 1px solid rgba(2, 132, 199, 0.4); }}

    .main-title {{
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 8px;
      color: #ffffff;
    }}

    .sub-title {{
      font-size: 11.5px;
      color: #cbd5e1;
      line-height: 1.5;
    }}

    /* Key Spec Strip */
    .spec-strip {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 22px;
    }}

    .spec-col-lbl {{
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--slate-500);
      margin-bottom: 3px;
    }}

    .spec-col-val {{
      font-size: 12px;
      font-weight: 700;
      color: var(--primary);
    }}

    /* Section Headers */
    .section-h2 {{
      font-family: 'Outfit', sans-serif;
      font-size: 14.5px;
      font-weight: 700;
      color: var(--primary);
      margin: 22px 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 1.5px solid var(--slate-200);
      display: flex;
      align-items: center;
      gap: 8px;
      page-break-after: avoid;
    }}

    .section-tag {{
      background: var(--primary);
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 4px;
    }}

    .section-h3 {{
      font-family: 'Outfit', sans-serif;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--slate-800);
      margin: 14px 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
      page-break-after: avoid;
    }}

    p {{
      margin-bottom: 8px;
      line-height: 1.55;
      color: var(--slate-700);
      text-align: justify;
    }}

    /* Architecture Tree */
    pre.code-tree {{
      background: #0b132b;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      line-height: 1.45;
      padding: 12px 14px;
      border-radius: 6px;
      margin: 10px 0 16px 0;
      white-space: pre;
      overflow-x: auto;
      border-left: 3px solid var(--accent);
    }}

    /* Data Table */
    table.data-table {{
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 10px;
      page-break-inside: auto;
    }}

    table.data-table th {{
      background: var(--slate-100);
      color: var(--slate-800);
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid var(--slate-200);
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
    }}

    table.data-table td {{
      padding: 6px 8px;
      border: 1px solid var(--slate-200);
      vertical-align: top;
      line-height: 1.4;
    }}

    table.data-table tr:nth-child(even) {{
      background: var(--slate-50);
    }}

    .mono {{
      font-family: 'JetBrains Mono', monospace;
    }}

    /* Milestone Cards */
    .milestone-grid {{
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 10px 0 16px 0;
    }}

    .milestone-card {{
      border: 1px solid var(--slate-200);
      border-left: 4px solid var(--primary-light);
      background: #ffffff;
      border-radius: 6px;
      padding: 10px 14px;
      page-break-inside: avoid;
    }}

    .m-hdr {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      border-bottom: 1px dashed var(--slate-200);
      padding-bottom: 4px;
    }}

    .m-title {{
      font-family: 'Outfit', sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--primary);
    }}

    .m-meta {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      color: var(--slate-500);
      font-weight: 600;
    }}

    .m-desc {{
      font-size: 10.5px;
      color: var(--slate-700);
      margin-bottom: 6px;
      line-height: 1.45;
    }}

    .m-crit {{
      font-size: 10px;
      background: var(--slate-50);
      padding: 5px 8px;
      border-radius: 4px;
      border-left: 2px solid var(--emerald-600);
      color: var(--slate-800);
    }}

    /* Callout Boxes */
    .callout-box {{
      border-radius: 6px;
      padding: 10px 14px;
      margin: 10px 0 14px 0;
      border-left: 4px solid;
      page-break-inside: avoid;
    }}

    .callout-amber {{ background: var(--amber-50); border-color: var(--amber-600); color: #78350f; }}
    .callout-blue {{ background: var(--blue-50); border-color: var(--blue-600); color: #0c4a6e; }}
    .callout-emerald {{ background: var(--emerald-50); border-color: var(--emerald-600); color: #064e3b; }}
    .callout-rose {{ background: var(--rose-50); border-color: var(--rose-600); color: #881337; }}
    .callout-purple {{ background: var(--purple-50); border-color: var(--purple-600); color: #4c1d95; }}

    .callout-title {{
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    /* Status Badges */
    .badge-status {{
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }}

    .badge-red {{ background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }}
    .badge-amber {{ background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }}
    .badge-blue {{ background: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }}
    .badge-green {{ background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }}

    /* Workflow Diagram Box */
    .workflow-container {{
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 6px;
      padding: 12px 14px;
      margin: 10px 0 16px 0;
    }}

    .workflow-step-row {{
      display: flex;
      align-items: stretch;
      gap: 8px;
      margin-bottom: 8px;
    }}

    .workflow-step-row:last-child {{
      margin-bottom: 0;
    }}

    .step-badge {{
      background: var(--primary);
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 9px;
      padding: 4px 8px;
      border-radius: 4px;
      min-width: 65px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }}

    .step-content {{
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 4px;
      padding: 6px 10px;
      flex: 1;
      font-size: 10px;
      line-height: 1.4;
    }}

    .step-content strong {{
      color: var(--primary);
    }}

    /* Signature Area */
    .sign-section {{
      margin-top: 24px;
      border-top: 1.5px solid var(--slate-200);
      padding-top: 16px;
      page-break-inside: avoid;
    }}

    .sign-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }}

    .sign-box {{
      border: 1px solid var(--slate-200);
      border-radius: 6px;
      padding: 12px 16px;
      background: var(--slate-50);
    }}

    .sign-header {{
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 11px;
      color: var(--primary);
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--slate-200);
    }}

    .sign-field {{
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 9.5px;
    }}

    .sign-field-lbl {{
      color: var(--slate-500);
      font-weight: 600;
    }}

    .sign-field-val {{
      color: var(--slate-800);
      font-weight: 700;
    }}

    .sign-seal {{
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed var(--slate-300);
      font-size: 9px;
      color: var(--slate-500);
      font-family: 'JetBrains Mono', monospace;
    }}

    @media screen {{
      table.document-print-wrapper > thead,
      table.document-print-wrapper > tfoot {{
        display: none !important;
      }}
      body {{
        padding: 20px 10px 80px 10px;
        background: #f1f5f9;
      }}
      .page-container {{
        margin: 0 auto 30px auto;
      }}
    }}

    @media print {{
      body {{
        background: #ffffff;
        padding: 0;
      }}
      .page-container {{
        max-width: 100%;
        margin: 0;
        padding: 10px 18px;
        box-shadow: none;
        border-radius: 0;
        border: none;
      }}
      .no-print {{
        display: none !important;
      }}
      table.data-table th, table.data-table td {{
        padding: 4px 6px;
        font-size: 9px;
      }}
      .section-h2 {{
        margin: 16px 0 8px 0;
        font-size: 13px;
      }}
      @page {{
        size: A4 portrait;
        margin: 9mm 9mm 9mm 9mm;
      }}
    }}
  </style>
</head>
<body>

<table class="document-print-wrapper">
  <thead>
    <tr>
      <td>
        <div class="running-header-strip">
          <div class="brand">
            <i class="fa-solid fa-code" style="color: #d97706;"></i>
            <span>SaNDS Lab Middle East W.L.L. &bull; Developer Engineering Guide (HRMS &amp; Mobile App)</span>
          </div>
          <div>
            <span class="ref-id">{ref}</span>
          </div>
        </div>
      </td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        <div class="page-container">

          <!-- TOP ACTION & NAVIGATION BAR (WEB VIEW ONLY) -->
          <div class="nav-bar-cluster no-print">
            <a href="index.php" class="nav-pill-btn"><i class="fa-solid fa-arrow-left"></i> Proposal Hub</a>
            <a href="HRMS_Module_Developer_Workflow_and_Milestones_Guide.pdf" class="nav-pill-btn btn-primary" download><i class="fa-solid fa-file-pdf"></i> Download Official PDF (6 Pages)</a>
            <a href="HRMS_Module_Service_Level_Agreement_SaNDS_Lab_UniGlobal.html" class="nav-pill-btn"><i class="fa-solid fa-file-contract"></i> Master SLA (HTML)</a>
            <a href="HRMS_Module_Technical_Clarifications_Response_SaNDS_Lab.html" class="nav-pill-btn"><i class="fa-solid fa-comments"></i> Technical Clarifications (HTML)</a>
            <a href="HRMS_SLA_Annexure_1_Payment_and_Timeline_Clarification.html" class="nav-pill-btn"><i class="fa-solid fa-scale-balanced"></i> Annexure 1 (HTML)</a>
          </div>

          <!-- LETTERHEAD BANNER -->
          <div class="letterhead-banner">
            <div class="letterhead-top">
              <div class="logos-cluster">
                <div class="logo-box">
                  <img src="{img_data_uri}" alt="SaNDS Lab Middle East">
                </div>
                <div class="logo-sep"></div>
                <div class="logo-box">
                  <img src="{uniglobal_b64}" alt="UniGlobal Consultancy Services">
                </div>
              </div>
              <div class="letter-ref-badge">
                <i class="fa-solid fa-code"></i> {ref}
              </div>
            </div>
            <div class="title-badge-row">
              <span class="badge-pill pill-accent"><i class="fa-solid fa-code-branch"></i> Engineering Architecture Manual</span>
              <span class="badge-pill pill-emerald"><i class="fa-solid fa-shield-halved"></i> 92 Functional Requirements Traceability</span>
              <span class="badge-pill pill-blue"><i class="fa-solid fa-bug"></i> Defect SLAs &amp; Complaint Lifecycle</span>
            </div>
            <h1 class="main-title">PROMPT HRMS &amp; Mobile App Subsystem</h1>
            <div class="sub-title">
              Complete Software Engineering Specification, 6-Milestone Delivery Gates (22 Weeks / 5.5 Months), Full-Stack Architecture Blueprints, 92 Requirements Traceability, Customer Grievance &amp; Defect Handling Protocols.
              <br><strong style="color:#fde68a;"><i class="fa-solid fa-ban"></i> STRICT INTERNAL COMPLIANCE: ZERO COMMERCIAL PRICING &bull; ZERO MONETARY VALUES &bull; PURE ENGINEERING WORKFLOW.</strong>
            </div>
          </div>

          <!-- KEY SPECIFICATION STRIP -->
          <div class="spec-strip">
            <div>
              <div class="spec-col-lbl">Document Type</div>
              <div class="spec-col-val"><i class="fa-solid fa-file-code" style="color:var(--accent);"></i> Developer SOW &amp; Manual</div>
            </div>
            <div>
              <div class="spec-col-lbl">Engineering Timeline</div>
              <div class="spec-col-val"><i class="fa-regular fa-clock" style="color:var(--blue-600);"></i> 22 Weeks (5.5 Months)</div>
            </div>
            <div>
              <div class="spec-col-lbl">Core Tech Stack</div>
              <div class="spec-col-val"><i class="fa-brands fa-react" style="color:var(--emerald-600);"></i> ReactJS &bull; .NET 8 &bull; SQL 2022</div>
            </div>
            <div>
              <div class="spec-col-lbl">Mobile Platform</div>
              <div class="spec-col-val"><i class="fa-solid fa-mobile-screen" style="color:var(--purple-600);"></i> React Native (Req 92)</div>
            </div>
          </div>

          <!-- SECTION 1 -->
          <div class="section-h2">
            <span class="section-tag">01</span>
            <span>Enterprise Solution Architecture &amp; Clean Architecture Directory Structure</span>
          </div>
          <p>
            The PROMPT HRMS Subsystem is architected following Microsoft Clean Architecture design principles to guarantee high testability, modular maintainability, strict separation of concerns, and seamless bi-directional integration with PROMPT ERP. All software engineers, frontend developers, mobile engineers, and database administrators must adhere strictly to the following project structure:
          </p>

          <pre class="code-tree">HRMS/
|-- backend/                           # C# .NET 8.0 LTS Enterprise Web API Solution
|   |-- HRMS.sln                       # Master Visual Studio Solution File
|   |-- src/
|   |   |-- HRMS.Domain/               # Core Enterprise Entities, Value Objects, Domain Events
|   |   |   |-- Entities/              # Employee, ShiftPattern, AttendancePunch, LeaveRecord, PayrollRun
|   |   |   |-- Enums/                 # ShiftType, LeaveType, SIOStatus, PIFSSStatus, DefectSeverity
|   |   |   |-- Rules/                 # Bahrain Labour Law EOSB, Kuwait Labour Law No. 6, Overtime Matrix
|   |   |   |-- Common/                # AuditableEntity, ValueObject, DomainEventBase
|   |   |-- HRMS.Application/          # CQRS Handlers, DTOs, FluentValidators, Business Services
|   |   |   |-- Payroll/               # SalaryEngine, OvertimeCalculator, SIOPensionEngine, EOSBAccrual
|   |   |   |-- Attendance/            # BiometricSyncService, RamadanShiftAdjuster, PenaltyCalculator
|   |   |   |-- Leaves/                # LeaveWorkflowEngine, EncashmentCalculator, AccrualEngine
|   |   |   |-- Common/                # IApplicationDbContext, ICurrentUserService, MappingProfiles
|   |   |-- HRMS.Infrastructure/       # EF Core 8 (CRUD/Audit) + Dapper (High-Speed Reporting Queries)
|   |   |   |-- Persistence/           # ApplicationDbContext, EntityConfigurations, Migrations
|   |   |   |-- BiometricListeners/    # TCP/IP Socket Push/Pull Hardware Sync Daemon
|   |   |   |-- Services/              # BankWpsFileGenerator (CBB/CBK), AuditLogger, LocalStorageService
|   |   |-- HRMS.API/                  # ASP.NET Core REST API, Controllers, Middleware, Auth Handlers
|   |       |-- Controllers/           # EmployeesController, AttendanceController, PayrollController
|   |       |-- Middleware/            # GlobalExceptionHandler, JwtAuthMiddleware, TenantSecurity
|   |       |-- Swagger/               # OpenAPI 3.0 Documentation &amp; Testing Console
|-- frontend/                          # ReactJS 18+ Web Application (Bilingual LTR/RTL)
|   |-- src/
|   |   |-- layouts/                   # Responsive Master Layout (Vertical Sidebar, Horizontal, Docked)
|   |   |-- theme/                     # Tokenized CSS Engine (Prompt ERP Matching Hex Codes &amp; Fonts)
|   |   |-- components/                # Drag-and-Drop Menu Tree, User Favorites Bar, Ad-Hoc Data Grid
|   |   |-- modules/                   # Employee, Shifts, Leaves, Payroll, Assets, 5 BU Costing, Audit
|   |   |-- i18n/                      # Full Bilingual Translation Dictionaries (English &amp; Arabic)
|-- mobile/                            # React Native Cross-Platform Application (Requirement 92)
|   |-- src/
|       |-- screens/                   # ESS Dashboard, Biometric Attendance, Leave Request, PaySlip
|       |-- offline/                   # SQLite Cache Daemon (Auto-sync upon connectivity restore)
|       |-- security/                  # Biometric Auth (FaceID/Fingerprint), GPS Geofencing Radius
|-- database/                          # Microsoft SQL Server 2022 / 2019+
|   |-- scripts/                       # Schema DDL, Stored Procedures, Triggers, Seed Data (.sql)
|   |-- migrations/                    # Automated EF Core Code-First Migration Scripts
|-- docs/                              # API Contracts, Postman Collections, Wireframes, User Manuals</pre>

          <!-- SECTION 2 -->
          <div class="section-h2">
            <span class="section-tag">02</span>
            <span>6-Milestone Delivery Roadmap &amp; Engineering Acceptance Gates (22 Weeks)</span>
          </div>
          <p>
            The project follows a 22-week (5.5-month / 110 working days) iterative engineering roadmap across six (6) distinct delivery milestones. Every milestone has strict verification benchmarks and an explicit Definition of Done (DoD) that developers must validate before submitting for client UAT sign-off:
          </p>

          <div class="milestone-grid">
            
            <!-- Milestone 1 -->
            <div class="milestone-card">
              <div class="m-hdr">
                <div class="m-title"><i class="fa-solid fa-layer-group" style="color:var(--emerald-600);"></i> Milestone 1: Core Architecture, Entity Master &amp; Loaded Rate Schema</div>
                <div class="m-meta">Weeks 1&ndash;4 (Month 1) &bull; Deliverable Ref: D-HRMS-M1</div>
              </div>
              <div class="m-desc">
                Clean Architecture scaffold, SQL Server 2022 DB migration engine, dual authentication handler (Prompt ERP API vs. local DB), Master Employee entity schema, 5 Business Units &amp; 4 CR data structure, Loaded Hourly Labour Rate schema (Base + Indemnity + Leave + SIO/PIFSS burden), bulk Excel importer, and Milestone 1 interactive UI/UX PoC wireframes.
              </div>
              <div class="m-crit">
                <strong>Engineering Verification Gate:</strong> 100% schema validation in SQL 2022; passing unit tests for bulk spreadsheet import parsing 500+ mock records; loaded rate calculation algorithm returns verified hourly cost rates consumable by CRM &amp; Project Tracker via REST API.
              </div>
            </div>

            <!-- Milestone 2 -->
            <div class="milestone-card">
              <div class="m-hdr">
                <div class="m-title"><i class="fa-solid fa-business-time" style="color:var(--accent);"></i> Milestone 2: Shift Engine, Biometric Hardware Sync &amp; Attendance Processing</div>
                <div class="m-meta">Weeks 5&ndash;8 (Month 2) &bull; Deliverable Ref: D-HRMS-M2</div>
              </div>
              <div class="m-desc">
                Multi-pattern shift scheduling (rotating, split, custom off-days), automated Ramadan working hours reduction engine (statutory rules for Muslim employees under Bahrain &amp; Kuwait laws), background TCP/IP socket daemon for direct physical biometric device synchronization, punch in/out pairing logic, manual punch regularization workflows, and penalty deductions calculator.
              </div>
              <div class="m-crit">
                <strong>Engineering Verification Gate:</strong> Physical or socket-simulated biometric device test transmitting real-time punches; automated pairing logic correctly flags missing punches, tardiness, and Ramadan 6-hour caps; penalty deduction engine passes all boundary test suites.
              </div>
            </div>

            <!-- Milestone 3 -->
            <div class="milestone-card">
              <div class="m-hdr">
                <div class="m-title"><i class="fa-solid fa-money-check-dollar" style="color:var(--primary-light);"></i> Milestone 3: Bahrain &amp; Kuwait Statutory Payroll Engine, Overtime &amp; EOSB Accruals</div>
                <div class="m-meta">Weeks 9&ndash;12 (Month 3) &bull; Deliverable Ref: D-HRMS-M3</div>
              </div>
              <div class="m-desc">
                Dual-country statutory payroll calculation engine implementing Bahrain Labour Law and Kuwait Labour Law No. 6 of 2010; SIO pension deductions (Bahraini vs. Expat) and PIFSS deductions (Kuwaiti vs. Expat); Overtime calculation matrix (1.25x normal day, 1.50x rest day/holiday); monthly End-of-Service Benefit (EOSB) indemnity accrual ledger with automatic GL reversal posting on termination; Bahrain CBB WPS file generator and Kuwait CBK WPS file generator.
              </div>
              <div class="m-crit">
                <strong>Engineering Verification Gate:</strong> Zero variance (0.000) mathematical reconciliation against client historical payroll runs down to the exact fils; WPS text file validation against official Central Bank specifications; automated journal entry generation for monthly EOSB provisions.
              </div>
            </div>

            <!-- Milestone 4 -->
            <div class="milestone-card">
              <div class="m-hdr">
                <div class="m-title"><i class="fa-solid fa-users-viewfinder" style="color:var(--blue-600);"></i> Milestone 4: Bilingual ESS/MSS Web Portals &amp; 5 BU Overhead Apportionment</div>
                <div class="m-meta">Weeks 13&ndash;16 (Month 4) &bull; Deliverable Ref: D-HRMS-M4</div>
              </div>
              <div class="m-desc">
                Fully responsive bilingual (Arabic RTL &amp; English LTR) Employee Self-Service (ESS) and Manager Self-Service (MSS) web portals; dynamic bilingual employee letter generator (Salary Certificate, NOC, Bank Letter) with merge fields; automated document expiry alerts (CPR, Passport, Visa, Residence, LMRA, Medical) with escalation rules; 5 Business Unit overhead cost allocation engine; sales commission payroll trigger endpoint.
              </div>
              <div class="m-crit">
                <strong>Engineering Verification Gate:</strong> Full self-service lifecycle test from employee leave request to manager multi-tier approval; dynamic PDF letter generation with Arabic merge tags; verified cost distribution reports apportioning shared back-office costs across all 5 BUs.
              </div>
            </div>

            <!-- Milestone 5 -->
            <div class="milestone-card">
              <div class="m-hdr">
                <div class="m-title"><i class="fa-solid fa-mobile-screen-button" style="color:var(--purple-600);"></i> Milestone 5: React Native Mobile Application &amp; Security Gateway (Req 92)</div>
                <div class="m-meta">Weeks 17&ndash;20 (Month 5) &bull; Deliverable Ref: D-HRMS-M5</div>
              </div>
              <div class="m-desc">
                Production-grade cross-platform mobile application in <strong>React Native</strong> for iOS and Android implementing all 14 mandatory clauses of Requirement 92: Biometric authentication (FaceID/Fingerprint), offline SQLite punch caching with automatic synchronization upon network reconnection, GPS geofencing radius validation, ESS leave requests, mobile payslip viewer, push notifications, and administrative device authorization console with remote wipe capability.
              </div>
              <div class="m-crit">
                <strong>Engineering Verification Gate:</strong> Physical APK/IPA installation on iOS and Android test devices; offline punch simulation followed by network restore auto-sync; GPS geofencing radius boundary validation (&plusmn;50m tolerance); admin remote device de-authorization test.
              </div>
            </div>

            <!-- Milestone 6 -->
            <div class="milestone-card">
              <div class="m-hdr">
                <div class="m-title"><i class="fa-solid fa-flag-checkered" style="color:var(--emerald-600);"></i> Milestone 6: User Acceptance Testing (UAT), Parallel Live Payroll &amp; Production Cutover</div>
                <div class="m-meta">Weeks 21&ndash;22 (Month 5.5) &bull; Deliverable Ref: D-HRMS-M6 (FINAL GO-LIVE)</div>
              </div>
              <div class="m-desc">
                End-to-end UAT verification against all 92 specifications; live parallel payroll run with client Finance and HR teams; bilingual administrative and end-user training sessions; Vulnerability Assessment &amp; Penetration Testing (VAPT) hardening; production server deployment and Go-Live Cutover (**LIVE at Week 22**).
              </div>
              <div class="m-crit">
                <strong>Engineering Verification Gate:</strong> Zero unresolved Severity 1 (Critical) or Severity 2 (Major) defects; parallel live payroll run executed with 100% reconciliation against manual finance records; formal execution of Milestone Acceptance Certificate.
              </div>
            </div>

          </div>

          <!-- SECTION 3 -->
          <div class="section-h2">
            <span class="section-tag">03</span>
            <span>Comprehensive Functional Requirements Breakdown (92 Reqs &amp; Acceptance Gates)</span>
          </div>
          <p>
            The HRMS module encompasses 92 discrete technical specifications digitized from the official requirements baseline. Developers must verify their implementation against these specific functional domains:
          </p>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 14%;">Domain Ref</th>
                <th style="width: 26%;">Functional Domain</th>
                <th style="width: 38%;">Core Capabilities &amp; Technical Requirements</th>
                <th style="width: 22%;">Developer Acceptance Criteria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="mono">3.1.01&ndash;3.1.13</td>
                <td><strong>Employee Master &amp; Document Expiry</strong></td>
                <td>Single master of record, personal data self-service changes with HR approval gate, tracking and configurable alerts for CPR, Passport, Visa, Residence, LMRA, Licences, Medical Insurance, and dependent documents with version history and document checklists.</td>
                <td>Change requests stay in pending state until HR approval; expiring documents trigger dashboard badges &amp; emails at 60/30/15 days.</td>
              </tr>
              <tr>
                <td class="mono">3.2.01&ndash;3.2.09</td>
                <td><strong>Letters Generator &amp; Asset Management</strong></td>
                <td>Bilingual automated letter generator (Salary Certificate, NOC, Bank Letter) with dynamic entity letterheads and salary component masking. Issued asset custody tracking (laptops, phones, vehicles) with return clearance upon offboarding and damaged asset recovery.</td>
                <td>Dynamic PDF export renders Arabic and English accurately; employee offboarding blocks final settlement if assets are unreturned.</td>
              </tr>
              <tr>
                <td class="mono">3.3.01&ndash;3.3.16</td>
                <td><strong>Statutory Pay &amp; Benefits Engine</strong></td>
                <td>Final settlement calculator at resignation/termination, notice period tracking, monthly leave salary accrual, annual air ticket accrual, salary advances recovery, SIO (Bahrain) &amp; PIFSS (Kuwait) statutory deductions, Overtime matrix (1.25x / 1.50x), and Central Bank WPS file export.</td>
                <td>WPS text files pass CBB and CBK formatting validators; monthly EOSB indemnity provisions post automated accrual journal entries to GL.</td>
              </tr>
              <tr>
                <td class="mono">3.4.01&ndash;3.4.10</td>
                <td><strong>Time, Attendance &amp; Leave Engine</strong></td>
                <td>Multi-pattern shift scheduling (rotating, split, custom off-days), Ramadan working hour reduction controls (6 hrs/day for Muslim staff), biometric device integration, attendance punch pairing, tardiness/early exit rules, and annual/sick/hajj leave ledgers.</td>
                <td>Biometric socket daemon auto-pairs IN/OUT punches; Ramadan schedules apply automatically based on Hijri calendar and religion flag.</td>
              </tr>
              <tr>
                <td class="mono">3.5.01&ndash;3.5.09</td>
                <td><strong>People Processes &amp; Talent Management</strong></td>
                <td>Digital onboarding checklist, probationary review alerts, annual performance appraisals with multi-rater scoring, training needs identification, training cost tracking, disciplinary incident logging, and structured offboarding clearance.</td>
                <td>Probation expiry alerts trigger 14 days prior to completion; performance appraisal workflow supports manager review and employee sign-off.</td>
              </tr>
              <tr>
                <td class="mono">3.6.01&ndash;3.6.06</td>
                <td><strong>Organisation &amp; 5 BU Cost Allocation</strong></td>
                <td>4 CR multi-company entity setup, 5 Business Units hierarchy, shared back-office headcount cost apportionment, and dynamic Loaded Hourly Labour Rate engine (Base salary + EOSB + Leave salary + SIO burden) exposed via REST API.</td>
                <td>Monthly payroll cost splits automatically across 5 BUs based on predefined percentage rules; Loaded Rate API responds in &lt;50ms.</td>
              </tr>
              <tr>
                <td class="mono">3.7.01&ndash;3.7.16</td>
                <td><strong>Reporting, Analytics &amp; Integration</strong></td>
                <td>25+ standard operational reports (Headcount, Turnover, Leave Liability, SIO, Payroll Summary, Overtime, Asset Register), ad-hoc column customizer, export to Excel/PDF, bi-directional REST APIs with PROMPT GL, and Milestone 1 UI/UX wireframes.</td>
                <td>Reports load in &lt;2.0 seconds for 1,000+ records; ad-hoc column selection persists per user; REST endpoints authenticate via JWT.</td>
              </tr>
              <tr>
                <td class="mono">3.8.01&ndash;3.8.11</td>
                <td><strong>Security, Privacy &amp; Audit Trail</strong></td>
                <td>Role-Based Access Control (RBAC), salary data masking for non-payroll users, immutable field-level audit trail (who, what, when, old value, new value), session timeout, password complexity, and Bahrain PDPL &amp; GDPR compliance.</td>
                <td>Field-level audit log records all salary edits; unauthorized access attempts return HTTP 403 Forbidden and log security alert.</td>
              </tr>
              <tr>
                <td class="mono">Req 92 (1&ndash;14)</td>
                <td><strong>React Native Mobile Application</strong></td>
                <td>Dedicated iOS and Android mobile app implementing all 14 mandatory clauses: Biometric login, GPS geofencing radius validation, offline SQLite caching, ESS leave applications, mobile payslips, push notifications, and admin device management.</td>
                <td>Offline punches sync seamlessly upon reconnection; GPS checks enforce configured workplace boundaries; remote wipe terminates session.</td>
              </tr>
            </tbody>
          </table>

          <!-- SECTION 4 -->
          <div class="section-h2">
            <span class="section-tag">04</span>
            <span>Developer Operational Workflow, Git Strategy &amp; Code Quality Standards</span>
          </div>
          <p>
            To maintain zero technical debt, ensure predictable milestone releases, and prevent merge collisions across squads, all engineers must comply with the following operational engineering protocols:
          </p>

          <div class="section-h3"><i class="fa-solid fa-code-fork" style="color:var(--accent);"></i> 4.1 Git Branching Strategy (GitFlow Standard)</div>
          <ul style="margin-left: 20px; font-size: 10.5px; line-height: 1.5; margin-bottom: 10px;">
            <li><strong><code>main</code>:</strong> Production-only branch. Code is merged here strictly upon milestone sign-off and production release tagging (e.g. <code>v1.0.0-M6</code>). Direct commits are permanently disabled.</li>
            <li><strong><code>develop</code>:</strong> Integration branch for continuous integration. All feature branches branch off and merge back into <code>develop</code> via Pull Requests (PRs).</li>
            <li><strong><code>feature/HRMS-&#123;id&#125;-&#123;description&#125;</code>:</strong> Developers create isolated feature branches for each requirement (e.g. <code>feature/HRMS-3.3.01-final-settlement</code>). Must rebase on <code>develop</code> before creating a PR.</li>
            <li><strong><code>bugfix/HRMS-&#123;ticket&#125;-&#123;description&#125;</code>:</strong> Created from <code>develop</code> for non-critical defect remediation identified during sprint testing or UAT.</li>
            <li><strong><code>hotfix/HRMS-&#123;p1_ticket&#125;</code>:</strong> Created directly from <code>main</code> strictly for Severity 1 (Critical) production patches. Merged back to both <code>main</code> and <code>develop</code> immediately upon deployment.</li>
          </ul>

          <div class="section-h3"><i class="fa-solid fa-list-check" style="color:var(--emerald-600);"></i> 4.2 Pull Request (PR) &amp; Code Review Checklist</div>
          <p>
            No code shall be merged into <code>develop</code> or <code>main</code> without satisfying the following mandatory gates:
          </p>
          <div class="callout-box callout-blue">
            <div class="callout-title" style="color:var(--blue-600);"><i class="fa-solid fa-circle-check"></i> Mandatory Definition of Done (DoD) Checklist</div>
            <ul style="margin-left: 18px; font-size: 10px; line-height: 1.45; margin: 0;">
              <li><strong>Peer Review:</strong> Minimum of one (1) approving review from a Senior Architect or Squad Lead.</li>
              <li><strong>Automated Unit Tests:</strong> New calculation logic (payroll, SIO, EOSB, overtime) must include unit tests with minimum <strong>80% code coverage</strong>.</li>
              <li><strong>Static Analysis:</strong> Clean Roslyn / SonarQube scan with zero critical code smells, security vulnerabilities, or cyclic dependencies.</li>
              <li><strong>Clean Architecture Compliance:</strong> Domain entities must remain pure POCOs without database or UI dependencies; all DB queries in Application/Infrastructure layers.</li>
              <li><strong>Database Migrations:</strong> Any schema alteration must include an EF Core migration file and verified idempotent SQL rollback script.</li>
              <li><strong>Bilingual UI Validation:</strong> Every frontend string must reference translation keys (<code>en.json</code> &amp; <code>ar.json</code>); hardcoded UI strings are rejected.</li>
            </ul>
          </div>

          <!-- SECTION 5 -->
          <div class="section-h2">
            <span class="section-tag">05</span>
            <span>Customer Complaints, Grievance Redressal &amp; Defect Severity Workflows</span>
          </div>
          <p>
            A high-reliability enterprise ERP deployment requires a structured, transparent, and rigorous bug-tracking and grievance redressal workflow. All defects, anomalies, and customer complaints logged by UniGlobal or Prompt ERP stakeholders during development, UAT, and post-go-live warranty must be processed through the following binding operational matrix:
          </p>

          <div class="section-h3"><i class="fa-solid fa-triangle-exclamation" style="color:var(--rose-600);"></i> 5.1 Defect Severity Classification Matrix &amp; Binding SLAs</div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 15%;">Severity Tier</th>
                <th style="width: 37%;">Technical Definition &amp; Operational Impact</th>
                <th style="width: 24%;" class="text-center">Response SLA</th>
                <th style="width: 24%;" class="text-center">Target Resolution SLA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge-status badge-red"><i class="fa-solid fa-circle-xmark"></i> Severity 1 (Critical)</span></td>
                <td>
                  <strong>System Halt / Blocker:</strong> Complete system outage, database corruption, total failure of monthly payroll processing, biometric hardware sync breakdown, security breach, or any issue halting all UAT testing.
                </td>
                <td class="text-center mono" style="color:var(--rose-600); font-weight:700;">Within 1 Hour</td>
                <td class="text-center mono" style="color:var(--rose-600); font-weight:700;">4 &ndash; 12 Hours<br><small style="color:var(--slate-500); font-weight:400;">Continuous engineer standby</small></td>
              </tr>
              <tr>
                <td><span class="badge-status badge-amber"><i class="fa-solid fa-triangle-exclamation"></i> Severity 2 (Major)</span></td>
                <td>
                  <strong>Major Functional Impairment:</strong> Major feature failure without a viable workaround (e.g. SIO/PIFSS calculation bug, EOSB indemnity accrual variance, REST API failure with Prompt GL, React Native mobile offline sync failure).
                </td>
                <td class="text-center mono" style="color:#b45309; font-weight:700;">Within 2 Hours</td>
                <td class="text-center mono" style="color:#b45309; font-weight:700;">Within 24 Hours</td>
              </tr>
              <tr>
                <td><span class="badge-status badge-blue"><i class="fa-solid fa-circle-info"></i> Severity 3 (Medium)</span></td>
                <td>
                  <strong>Non-Critical Functional Defect:</strong> Minor feature anomaly where an acceptable operational workaround exists (e.g. reporting filter anomaly, UI sorting inconsistency, non-blocking notification delay).
                </td>
                <td class="text-center mono" style="color:var(--blue-600); font-weight:700;">Within 4 Hours</td>
                <td class="text-center mono" style="color:var(--blue-600); font-weight:700;">48 &ndash; 72 Hours</td>
              </tr>
              <tr>
                <td><span class="badge-status badge-green"><i class="fa-solid fa-check"></i> Severity 4 (Minor)</span></td>
                <td>
                  <strong>Cosmetic / Minor Enhancement:</strong> Typographical errors, minor translation alignment, button styling suggestions, or cosmetic layout refinements that do not impede functional usage.
                </td>
                <td class="text-center mono" style="color:var(--emerald-600); font-weight:700;">Within 8 Hours</td>
                <td class="text-center mono" style="color:var(--emerald-600); font-weight:700;">Next Sprint Release<br><small style="color:var(--slate-500); font-weight:400;">Scheduled deployment cycle</small></td>
              </tr>
            </tbody>
          </table>

          <div class="section-h3"><i class="fa-solid fa-arrows-spin" style="color:var(--blue-600);"></i> 5.2 End-to-End Defect Lifecycle &amp; Resolution Workflow</div>
          <p>
            Every customer complaint and defect ticket must transition through the formal 6-stage engineering lifecycle:
          </p>

          <div class="workflow-container">
            <div class="workflow-step-row">
              <div class="step-badge">STAGE 1</div>
              <div class="step-content">
                <strong>Logging &amp; Ticket Capture:</strong> Client or QA logs issue in the Project Management Portal with mandatory metadata: Environment (Staging/Prod), Module, Steps to Reproduce, Expected vs. Actual Result, and Screenshots/Logs.
              </div>
            </div>
            <div class="workflow-step-row">
              <div class="step-badge">STAGE 2</div>
              <div class="step-content">
                <strong>Triage &amp; Severity Assignment:</strong> Squad Lead reviews ticket within the Response SLA, assigns formal Severity Tier (P1&ndash;P4), verifies reproducibility, and assigns to the designated module developer.
              </div>
            </div>
            <div class="workflow-step-row">
              <div class="step-badge">STAGE 3</div>
              <div class="step-content">
                <strong>Root Cause Analysis (RCA) &amp; Patch Development:</strong> Developer isolates the root cause (Domain Rule, Stored Procedure, API, or Mobile State), develops the patch, and writes an automated regression test.
              </div>
            </div>
            <div class="workflow-step-row">
              <div class="step-badge">STAGE 4</div>
              <div class="step-content">
                <strong>Code Review &amp; Staging QA Verification:</strong> PR is submitted, reviewed by Architect, and deployed to Staging environment. QA executes regression test suite to verify the bug is eliminated without side effects.
              </div>
            </div>
            <div class="workflow-step-row">
              <div class="step-badge">STAGE 5</div>
              <div class="step-content">
                <strong>Deployment &amp; Client Verification:</strong> Patch is published to UAT / Production. Client is notified via formal Release Note and conducts verification within 3 business days.
              </div>
            </div>
            <div class="workflow-step-row">
              <div class="step-badge">STAGE 6</div>
              <div class="step-content">
                <strong>Post-Mortem &amp; Ticket Closure:</strong> For all Severity 1 and Severity 2 incidents, a formal RCA Post-Mortem report is archived in the portal and ticket is transitioned to Closed status.
              </div>
            </div>
          </div>

          <div class="section-h3"><i class="fa-solid fa-sitemap" style="color:var(--accent);"></i> 5.3 Customer Grievance &amp; Escalation Hierarchy</div>
          <p>
            If a defect is not resolved within the SLA resolution target, or if a customer complaint requires executive intervention, the following 3-tier escalation hierarchy triggers automatically:
          </p>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 22%;">Escalation Level</th>
                <th style="width: 26%;">Responsible Role</th>
                <th style="width: 24%;">Channel</th>
                <th style="width: 28%;">Escalation Trigger Threshold</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Level 1: Operational</strong></td>
                <td>HRMS Squad Lead / Scrum Master</td>
                <td>Project Management Portal &bull; Desk Support</td>
                <td>Initial ticket creation &amp; normal sprint resolution</td>
              </tr>
              <tr>
                <td><strong>Level 2: Technical Management</strong></td>
                <td>Senior Project Manager &amp; Lead Architect</td>
                <td>Phone &bull; pm@sandslab.com</td>
                <td>Severity 1 unresolved &gt; 4 hrs &bull; Severity 2 &gt; 12 hrs</td>
              </tr>
              <tr>
                <td><strong>Level 3: Executive Governance</strong></td>
                <td><strong>Ajit Kumar KV (Executive Director)</strong></td>
                <td>Direct Line &bull; ajit@sandslab.com</td>
                <td>Severity 1 unresolved &gt; 8 hrs &bull; Milestone gate delayed &gt; 3 days</td>
              </tr>
            </tbody>
          </table>

          <!-- SECTION 6 -->
          <div class="section-h2">
            <span class="section-tag">06</span>
            <span>Post-Deployment Warranty, Hypercare &amp; Infrastructure Uptime Governance</span>
          </div>
          <p>
            Following Milestone 6 Go-Live Cutover (Week 22), the project enters a structured 60-Day Hypercare &amp; Warranty phase. Developers must follow these operational rules:
          </p>
          <ul style="margin-left: 20px; font-size: 10.5px; line-height: 1.5; margin-bottom: 10px;">
            <li><strong>Two Live Payroll Cycles Standby:</strong> Dedicated engineering standby across the first two live monthly payroll runs to ensure flawless WPS bank transfers, SIO reconciliation, and GL posting.</li>
            <li><strong>Zero-Cost Bug Remediation:</strong> 100% free engineering remediation of any software bugs or latent calculation variances identified against the 92 requirements.</li>
            <li><strong>Rapid Hypercare Triage:</strong> Daily virtual morning standups during the initial 14 calendar days post-go-live; weekly review sessions thereafter.</li>
          </ul>

          <div class="callout-box callout-amber">
            <div class="callout-title" style="color:#92400e;"><i class="fa-solid fa-server"></i> Developer Note: Infrastructure Boundary &amp; SLA Voidance Rule</div>
            <p style="font-size: 10px; color:#78350f; margin: 0; line-height: 1.45;">
              <strong>Provider-Managed vs. Client-Handled Servers:</strong> The 99.5% Service Availability &amp; Infrastructure Uptime SLA applies <strong>strictly if SaNDS Lab provides and directly manages the hosting server environment</strong>. If the server is provided, hosted, or administered by the Client, the 99.5% uptime SLA is null and void. In client-hosted environments, SaNDS Lab's responsibility is confined strictly to application software bug remediation under Section 05.
            </p>
          </div>

          <!-- SIGN-OFF SECTION -->
          <div class="sign-section">
            <div class="section-h2" style="border-bottom:none; margin-top:0;">
              <span class="section-tag">07</span>
              <span>Engineering Governance &amp; Developer Acceptance Sign-Off</span>
            </div>
            <p style="font-size:10px; color:var(--slate-500); margin-bottom:12px;">
              By signing below, the engineering and architectural leadership endorse this technical specification, milestone roadmap, and defect management workflow as the authoritative operational standard for the PROMPT HRMS Subsystem:
            </p>

            <div class="sign-grid">
              
              <!-- SaNDS Lab -->
              <div class="sign-box">
                <div class="sign-header">Submitted &amp; Executed By (Engineering Delivery)</div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Executing Entity:</span>
                  <span class="sign-field-val">SaNDS Lab Middle East W.L.L.</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Commercial Reg:</span>
                  <span class="sign-field-val">CR No. 177724-1 (Kingdom of Bahrain)</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Registered Address:</span>
                  <span class="sign-field-val">Block 712, Flat 24, Bldg 661, Road 1208, Salmabad</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Lead Architect:</span>
                  <span class="sign-field-val">Ajit Kumar KV (Executive Director)</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Engineering Lead:</span>
                  <span class="sign-field-val">Principal Full-Stack Solutions Architect</span>
                </div>
                <div class="sign-seal">
                  &bull; SaNDS LAB ENGINEERING WORKFLOW BASELINE VERIFIED &bull;
                </div>
              </div>

              <!-- UniGlobal -->
              <div class="sign-box">
                <div class="sign-header">Acknowledged &amp; Baselined By (Client Consultant)</div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Client Entity:</span>
                  <span class="sign-field-val">UniGlobal Consultancy Services W.L.L.</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Commercial Reg:</span>
                  <span class="sign-field-val">CR No. 98304-03 (Kingdom of Bahrain)</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">On Behalf Of:</span>
                  <span class="sign-field-val">Prompt ERP Solutions</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Client Executive:</span>
                  <span class="sign-field-val">Managing Director / Project Sponsor</span>
                </div>
                <div class="sign-field">
                  <span class="sign-field-lbl">Client Technical SPOC:</span>
                  <span class="sign-field-val">Lead Enterprise Architect &bull; Prompt ERP</span>
                </div>
                <div class="sign-seal">
                  &bull; UNIGLOBAL TECHNICAL SPECIFICATIONS BASELINED &bull;
                </div>
              </div>

            </div>
          </div>

        </div>
      </td>
    </tr>
  </tbody>

  <tfoot>
    <tr>
      <td>
        <div class="running-footer-strip">
          <div class="confidential">
            <i class="fa-solid fa-shield-halved" style="color: #059669;"></i>
            <span>Strictly Confidential &bull; SaNDS Lab &amp; UniGlobal Engineering Proprietary</span>
            <span class="running-sep">|</span>
            <span>Developer Engineering Guide &bull; Ref: {ref} &bull; Zero Pricing</span>
          </div>
          <div>
            <span>Kingdom of Bahrain</span>
          </div>
        </div>
      </td>
    </tr>
  </tfoot>
</table>

<!-- FLOATING PDF DOWNLOAD BUTTON (WEB VIEW ONLY) -->
<a href="HRMS_Module_Developer_Workflow_and_Milestones_Guide.pdf" class="floating-pdf-btn no-print" download title="Download Official PDF (6 Pages)">
  <i class="fa-solid fa-file-pdf"></i> Download Official PDF (6 Pages)
</a>

</body>
</html>
'''

output_html = 'HRMS_Module_Developer_Workflow_and_Milestones_Guide.html'
output_pdf = 'HRMS_Module_Developer_Workflow_and_Milestones_Guide.pdf'

with open(output_html, 'w', encoding='utf-8') as f:
    f.write(html_content)
print(f'Successfully wrote {output_html}!')

chrome_bin = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
abs_html = os.path.abspath(output_html)
abs_pdf = os.path.abspath(output_pdf)

cmd = [
    chrome_bin,
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    f'--print-to-pdf={abs_pdf}',
    abs_html
]

print('Compiling HRMS Developer Guide PDF via Chrome Headless...')
res = subprocess.run(cmd, capture_output=True, text=True)

if os.path.exists(abs_pdf):
    # Stamp Professional Running Page Numbers (Page X of Y)
    doc = fitz.open(abs_pdf)
    total_pages = len(doc)
    for idx, page in enumerate(doc):
        w = page.rect.width
        h = page.rect.height
        page_text = f'Page {idx + 1} of {total_pages}'
        rect_bot = fitz.Rect(0, h - 28, w, h - 8)
        page.insert_textbox(rect_bot, page_text, fontsize=8.5, fontname='helv', color=(0.35, 0.42, 0.52), align=fitz.TEXT_ALIGN_CENTER)
    
    temp_pdf = abs_pdf + '.stamped.tmp'
    doc.save(temp_pdf)
    doc.close()
    os.replace(temp_pdf, abs_pdf)

    reader = pypdf.PdfReader(abs_pdf)
    size_kb = os.path.getsize(abs_pdf) / 1024
    hdr_count = sum(1 for p in reader.pages if 'SaNDS Lab Middle East' in p.extract_text() or 'Developer Engineering Guide' in p.extract_text())
    ftr_count = sum(1 for p in reader.pages if 'Strictly Confidential' in p.extract_text() or 'Kingdom of Bahrain' in p.extract_text())
    page_num_count = sum(1 for p in reader.pages if 'Page ' in p.extract_text() and f' of {total_pages}' in p.extract_text())
    print(f'SUCCESS: {output_pdf} generated! Pages: {len(reader.pages)}, Size: {size_kb:.1f} KB, Headers: {hdr_count}/{len(reader.pages)}, Footers: {ftr_count}/{len(reader.pages)}, Page Numbers: {page_num_count}/{len(reader.pages)}')
    for i, page in enumerate(reader.pages):
        print(f'  Page {i+1}: length={len(page.extract_text())}')
else:
    print('ERROR: PDF generation failed!')
