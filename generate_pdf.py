import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (Skip on first page / cover)
        if self._pageNumber > 1:
            self.drawString(54, 800, "YOURSCHOOL / TEACHHUB - TECHNICAL & SYSTEM ARCHITECTURE DOCUMENT")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 792, 541, 792)

        # Footer (on all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 541, 45)

        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "https://yourschoolacademy.com | Confidential & Proprietary")
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(541, 32, page_text)
        self.restoreState()

def create_techhub_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    PRIMARY = colors.HexColor("#1E3A8A")    # Deep Navy Blue
    SECONDARY = colors.HexColor("#0284C7")  # Bright Sky Blue
    ACCENT = colors.HexColor("#0D9488")     # Teal Accent
    DARK_TEXT = colors.HexColor("#1E293B")  # Charcoal Text
    LIGHT_BG = colors.HexColor("#F8FAFC")   # Light Gray Slate
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=DARK_TEXT
    )

    story = []

    # ================= COVER / HEADER SECTION =================
    header_data = [
        [
            Paragraph("<b>TEACHHUB / YOURSCHOOL</b><br/><font size=9 color='#64748B'>Comprehensive System Architecture & Feature Manual</font>", ParagraphStyle('HHead', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=PRIMARY)),
            Paragraph("<font size=9><b>Live URL:</b> <a href='https://yourschoolacademy.com/' color='#0284C7'><u>yourschoolacademy.com</u></a><br/><b>Generated:</b> September 2026<br/><b>Version:</b> Release v6.0</font>", ParagraphStyle('HMeta', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=DARK_TEXT, alignment=2))
        ]
    ]
    t_header = Table(header_data, colWidths=[310, 177])
    t_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 12))

    # Intro Card (Hinglish Overview)
    intro_html = (
        "<b>Overview (परिचय):</b><br/>"
        "YourSchool (TeachHub) ek advanced, full-stack multi-tenant School Management Platform hai. "
        "Is system ko schools, academies, teachers, students aur super-admins ke pure academic aur financial workflows "
        "ko automate karne ke liye design kiya gaya hai. Is document me Technical Stack, Payment Architecture, "
        "Authentications, Login Workflow aur Sabhi Roles (Super Admin, Admin, Teacher, Student, Pending User) ke features ki poori jankari di gayi hai."
    )
    story.append(Paragraph(intro_html, body_style))
    story.append(Spacer(1, 8))

    # ================= SECTION 1: LIVE URLS & PORTALS =================
    story.append(Paragraph("1. Live Web Portals & Login Links (लाइव लिंक्स & पोर्टल्स)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=2, spaceAfter=8))

    links_data = [
        [Paragraph("Portal Type", table_header_style), Paragraph("Live URL Link", table_header_style), Paragraph("Description (विवरण)", table_header_style)],
        [
            Paragraph("Main Website", table_cell_style),
            Paragraph("<a href='https://yourschoolacademy.com/' color='#0284C7'><u>yourschoolacademy.com</u></a>", table_cell_style),
            Paragraph("Main Landing Page, School Landing pages, Public Features & General Information.", table_cell_style)
        ],
        [
            Paragraph("Student Login", table_cell_style),
            Paragraph("<a href='https://yourschoolacademy.com/student/login' color='#0284C7'><u>student/login</u></a>", table_cell_style),
            Paragraph("Dedicated login portal for Students to view attendance, report cards & fees.", table_cell_style)
        ],
        [
            Paragraph("Teacher Login", table_cell_style),
            Paragraph("<a href='https://yourschoolacademy.com/teacher/login' color='#0284C7'><u>teacher/login</u></a>", table_cell_style),
            Paragraph("Portal for Teachers to mark attendance, upload study notes & enter marks.", table_cell_style)
        ],
        [
            Paragraph("Admin Login", table_cell_style),
            Paragraph("<a href='https://yourschoolacademy.com/admin/login' color='#0284C7'><u>admin/login</u></a>", table_cell_style),
            Paragraph("School Admin/Principal dashboard for fee setup, user approvals & payroll.", table_cell_style)
        ],
    ]
    t_links = Table(links_data, colWidths=[95, 170, 222])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_links)
    story.append(Spacer(1, 14))

    # ================= SECTION 2: TECHNICAL STACK =================
    story.append(Paragraph("2. Technical Stack & Architecture (तकनीकी आर्किटेक्चर)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=2, spaceAfter=8))

    tech_intro = (
        "TeachHub modern web and mobile tech stack par build kiya gaya hai jo high scalability, security, "
        "aur real-time data synchronization provide karta hai:"
    )
    story.append(Paragraph(tech_intro, body_style))

    tech_table_data = [
        [Paragraph("Category", table_header_style), Paragraph("Technologies Used", table_header_style), Paragraph("Role & Functionality in App", table_header_style)],
        [
            Paragraph("<b>Backend Stack</b>", table_cell_style),
            Paragraph("Node.js, Express.js (v5)<br/>MongoDB & Mongoose ODM", table_cell_style),
            Paragraph("RESTful API Server, high performance asynchronous request handling, flexible MongoDB schema database for multi-school tenant data.", table_cell_style)
        ],
        [
            Paragraph("<b>Authentication & Security</b>", table_cell_style),
            Paragraph("JWT (JSON Web Tokens), Bcryptjs, Sanitize-HTML", table_cell_style),
            Paragraph("Secure token-based auth with HTTP authorization headers, password hashing using bcrypt, and strict XSS HTML sanitization for text inputs.", table_cell_style)
        ],
        [
            Paragraph("<b>Real-time & Media</b>", table_cell_style),
            Paragraph("Socket.io (v4), Cloudinary API, Multer", table_cell_style),
            Paragraph("Real-time WebSockets for instant user approval notifications & status changes. Cloud storage integration for images, avatars, study notes & documents.", table_cell_style)
        ],
        [
            Paragraph("<b>Push Notifications & Email</b>", table_cell_style),
            Paragraph("Firebase Admin SDK (FCM), Nodemailer", table_cell_style),
            Paragraph("Cross-platform Firebase Push Notifications sent to Android native apps. Automated email alerts for password reset & OTPs.", table_cell_style)
        ],
        [
            Paragraph("<b>Frontend Web Stack</b>", table_cell_style),
            Paragraph("React 19, Vite Engine,<br/>Tailwind CSS 3, Lucide Icons", table_cell_style),
            Paragraph("Ultra-fast Single Page Application (SPA), responsive UI styled with Tailwind CSS, modular component architecture.", table_cell_style)
        ],
        [
            Paragraph("<b>Routing & Data Viz</b>", table_cell_style),
            Paragraph("React Router DOM 7, Recharts, Axios", table_cell_style),
            Paragraph("Client-side dynamic routing with protected role layout guards. Interactive visual analytics charts for attendance, revenue & grades.", table_cell_style)
        ],
        [
            Paragraph("<b>Mobile Native App Stack</b>", table_cell_style),
            Paragraph("Capacitor JS (@capacitor/core, @capacitor/android, push-notifications)", table_cell_style),
            Paragraph("Converts React frontend into standalone Native Android Apps (StudentApp & TeacherApp APK/AAB) with hardware device features access.", table_cell_style)
        ],
        [
            Paragraph("<b>Document Generator</b>", table_cell_style),
            Paragraph("jsPDF, HTML-to-PDF engine", table_cell_style),
            Paragraph("Client-side Instant PDF generation for Student Report Cards, Fee Receipts, and Attendance Summaries.", table_cell_style)
        ],
    ]
    t_tech = Table(tech_table_data, colWidths=[100, 160, 227])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 14))

    # ================= SECTION 3: PAYMENT SYSTEM =================
    story.append(Paragraph("3. Payment Gateway & Financial Management System (पेमेंट सिस्टम)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=2, spaceAfter=8))

    pay_desc = (
        "TeachHub me ek robust <b>Hybrid Dual Payment Architecture</b> use kiya gaya hai jo online direct transactions "
        "aur offline manual verification dono support karta hai:"
    )
    story.append(Paragraph(pay_desc, body_style))

    story.append(Paragraph("<b>A. Payment Gateways & Processing Modes:</b>", h2_style))
    story.append(Paragraph("• <b>1. Online Payment via Razorpay Gateway Integration:</b><br/>"
                           "Razorpay API key/secret ke dwara direct order creation (<code>createStudentOrder</code>, <code>createSubscriptionOrder</code>) "
                           "aur SHA-256 HMAC cryptographic signature verification hoti hai. Student ya Admin UPI, Credit Card, Debit Card, "
                           "Net Banking se instant pay kar sakte hain aur immediate successful payment receipt auto-generate hoti hai.", bullet_style))
    
    story.append(Paragraph("• <b>2. Offline Payment Approval System (Cash / Manual UPI QR):</b><br/>"
                           "Agar student cash deposit karta hai ya direct QR code scan karke transfer karta hai, to app me <code>offline-request</code> submit "
                           "kiya jata hai (with UTR Number, payment screenshot, notes). Admin Dashboard me alert aata hai, jaha Admin receipt check karke "
                           "<code>approve-offline</code> ya <code>reject-offline</code> kar sakta hai.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>B. Financial Modules Supported (क्या-क्या पेमेंट होता है):</b>", h2_style))
    story.append(Paragraph("• <b>Student School Fees:</b> Admin dynamic <i>FeePlan</i> (Tuition Fee, Admission Fee, Transport, Exam Fee) create karte hain. Cycles: Monthly, Quarterly, One-time. Students fee status track karke pay karte hain.", bullet_style))
    story.append(Paragraph("• <b>School SaaS Subscription:</b> School Admin Superadmin ko TeachHub platform access service subscription pay karta hai. Superadmin free-trial period bhi grant kar sakta hai.", bullet_style))
    story.append(Paragraph("• <b>Teacher Payroll & Salaries:</b> Admin sabhi teachers ke monthly compensation structure set karte hain, total payout amount mark-paid karte hain aur pending salary ledger balance maintain rehta hai.", bullet_style))
    story.append(Paragraph("• <b>Payment Audit Logs & Receipts:</b> Har ek financial transaction ka complete audit trail (PaymentAuditLog model) maintain hota hai. Instant downloadable branded PDF receipts generate hoti hain (e.g., <code>TH-2026-XXXXX</code>).", bullet_style))

    story.append(Spacer(1, 14))

    # ================= SECTION 4: LOGIN & POST-LOGIN WORKFLOW =================
    story.append(Paragraph("4. Authentication & Post-Login Flow (लॉगिन के बाद क्या होता है)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=2, spaceAfter=8))

    flow_text = (
        "Jab user system me login ya register karta hai, to system ka precise Security & Routing Workflow chalta hai:"
    )
    story.append(Paragraph(flow_text, body_style))

    flow_table_data = [
        [Paragraph("Step", table_header_style), Paragraph("Workflow Phase", table_header_style), Paragraph("Technical Mechanism & User Experience", table_header_style)],
        [
            Paragraph("<b>Step 1</b>", table_cell_style),
            Paragraph("User Credentials Entry", table_cell_style),
            Paragraph("User specific page (<code>/student/login</code>, <code>/teacher/login</code>, <code>/admin/login</code>) par email/password enter karta hai ya Google Auth use karta hai.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 2</b>", table_cell_style),
            Paragraph("JWT Token & Role Verify", table_cell_style),
            Paragraph("Backend credentials verify karke JWT Access Token returning karta hai. User ka <code>role</code> (student, teacher, admin, superadmin) aur <code>requestStatus</code> fetch hota hai.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 3</b>", table_cell_style),
            Paragraph("Status-Based Routing Guard", table_cell_style),
            Paragraph("• Agar <code>requestStatus === 'pending'</code> -> Directed to <b>Pending Approval Page</b>.<br/>"
                      "• Agar <code>requestStatus === 'approved'</code> & <code>role === 'student'</code> -> <b>Student Dashboard</b>.<br/>"
                      "• Agar <code>requestStatus === 'approved'</code> & <code>role === 'teacher'</code> -> <b>Teacher Dashboard</b>.<br/>"
                      "• Agar <code>role === 'admin'</code> -> <b>Admin Dashboard</b>.<br/>"
                      "• Agar <code>role === 'superadmin'</code> -> <b>Super Admin Control Panel</b>.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 4</b>", table_cell_style),
            Paragraph("Real-Time WebSockets Sync", table_cell_style),
            Paragraph("Socket.io active connection establish rehta hai. Jab Admin pending user ko approve karta hai, tab user ko page reload kiye bina automatically Live Dashboard me redirect kar diya jata hai.", table_cell_style)
        ],
    ]
    t_flow = Table(flow_table_data, colWidths=[45, 140, 302])
    t_flow.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_flow)
    story.append(Spacer(1, 14))

    # ================= SECTION 5: DETAILED FEATURES BY ROLE =================
    story.append(Paragraph("5. Detailed Feature Breakdown by User Role (सभी रोल्स के फीचर्स)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=2, spaceAfter=8))

    # --- PENDING PAGE ---
    story.append(Paragraph("A. Pending Approval Page Features (पेंडिंग पेज के फीचर्स)", h2_style))
    story.append(Paragraph("Jab tak School Principal ya Admin new Student/Teacher ki registration request approve nahi kar deta, user <b>Pending Page</b> par rehta hai. Features include:", body_style))
    story.append(Paragraph("• <b>Live Registration Status Banner:</b> Real-time status display karta hai (e.g. <i>'Pending Approval'</i>, <i>'Entrance Test Scheduled'</i>, <i>'Under Review'</i>).", bullet_style))
    story.append(Paragraph("• <b>Requested School & Role Display:</b> Show karta hai ki user ne kis school aur kis role (Student ya Teacher) ke liye apply kiya hai.", bullet_style))
    story.append(Paragraph("• <b>Online Admission Exam Portal:</b> Agar school ne entrance exam mandatory kiya hai, to student issi page se online entrance exam de sakta hai. Exam complete hone par status <i>'exam_completed'</i> update ho jata hai.", bullet_style))
    story.append(Paragraph("• <b>Socket.io Real-time Listener:</b> Admin ke approve/reject action karte hi bina refresh kiye instant dashboard redirect hota hai.", bullet_style))
    story.append(Paragraph("• <b>Request Re-submission & School Change:</b> User galat school choose karne par request modify ya school change kar sakta hai.", bullet_style))
    story.append(Spacer(1, 8))

    # --- STUDENT PAGE ---
    story.append(Paragraph("B. Student Portal Features (स्टूडेंट पेज के फीचर्स)", h2_style))
    story.append(Paragraph("Approved Students ke liye dedicated academic & fee portal:", body_style))
    story.append(Paragraph("• <b>Personal Student Dashboard:</b> Class, Section, Roll Number, Daily Attendance Percentage, Pending Fees summary, aur Upcoming Exams alert.", bullet_style))
    story.append(Paragraph("• <b>Online Fee Payment & History:</b> Tuition, Exam aur Transport fee breakdown dekhna, Razorpay online gateway se pay karna ya Cash UTR upload karna, aur branded PDF payment receipts download karna.", bullet_style))
    story.append(Paragraph("• <b>Academic Results & Report Cards:</b> Term-wise (Unit Test, Half Yearly, Annual) marks, grades, percentage, class merit rank, aur complete PDF Report Card download.", bullet_style))
    story.append(Paragraph("• <b>Digital Study Materials & Notes:</b> Teachers dwaara upload kiye gaye Subject Notes, PDF assignments, syllabus tracking documents view/download karna.", bullet_style))
    story.append(Paragraph("• <b>Attendance History Calendar:</b> Month-by-month interactive calendar view (Present, Absent, Leave indicators).", bullet_style))
    story.append(Paragraph("• <b>Mobile Native App (APK):</b> StudentApp native Android app push notifications ke saath for instant exam & homework alerts.", bullet_style))
    story.append(Spacer(1, 8))

    # --- TEACHER PAGE ---
    story.append(Paragraph("C. Teacher Portal Features (टीचर पेज के फीचर्स)", h2_style))
    story.append(Paragraph("Teachers ke daily classroom management & grading tools:", body_style))
    story.append(Paragraph("• <b>Class & Subject Schedule:</b> Assigned classes, sections aur daily subject timetable ka structured display.", bullet_style))
    story.append(Paragraph("• <b>Digital Attendance Marking:</b> Single-click daily student attendance take karna (Present / Absent / Late mark karna).", bullet_style))
    story.append(Paragraph("• <b>Exam Marks & Grading Entry:</b> Exam terms ke mutabiq students ke marks input karna with auto-grade calculation.", bullet_style))
    story.append(Paragraph("• <b>Study Notes & Media Upload:</b> Subject-wise notes, PDF documents, Cloudinary uploaded files aur YouTube lecture links publish karna.", bullet_style))
    story.append(Paragraph("• <b>Syllabus Progress Tracker:</b> Subject syllabus modules mark completed karna aur visual completion percentage metrics dekhna.", bullet_style))
    story.append(Paragraph("• <b>Salary & Compensation Ledger:</b> Monthly salary status, payout history aur salary receipts view karna.", bullet_style))
    story.append(Spacer(1, 8))

    # --- ADMIN PAGE ---
    story.append(Paragraph("D. Admin Portal Features (एडमिन / स्कूल प्रिंसिपल के फीचर्स)", h2_style))
    story.append(Paragraph("School Directors aur Principals ke liye full institutional management control panel:", body_style))
    story.append(Paragraph("• <b>School Branding & Public Profile:</b> School name, logo, principal photo, contact details, address, description aur banner management.", bullet_style))
    story.append(Paragraph("• <b>User Approval & Admission Desk:</b> Pending Student aur Teacher applications verify karna, approve/reject karna, ya entrance exam schedule karna.", bullet_style))
    story.append(Paragraph("• <b>Fee Plan Engine & Structure:</b> Custom Fee Plans (Monthly, Quarterly, One-Time) create karna, class-wise fee apply karna.", bullet_style))
    story.append(Paragraph("• <b>Offline Payment Verification:</b> Cash / Manual UPI offline payment proofs review karna, UTR check karke approve/reject karna.", bullet_style))
    story.append(Paragraph("• <b>Teacher Payroll Management:</b> Teachers ke base salary & compensation set karna, payout mark karna, salary ledger maintain karna.", bullet_style))
    story.append(Paragraph("• <b>Academic Year & Class Management:</b> Academic session set karna, Classes (e.g. Class 1 to 12), Sections (A,B,C), aur Subjects assign karna.", bullet_style))
    story.append(Paragraph("• <b>Exams, Results & Merit Roll Generator:</b> Exam schedule create karna, marks verify karna, automatic Merit Roll rank generate karna aur Report Cards issue karna.", bullet_style))
    story.append(Paragraph("• <b>Notice Board & Push Broadcast:</b> School-wide circulars, notices aur mobile push notifications send karna for events & holidays.", bullet_style))
    story.append(Spacer(1, 8))

    # --- SUPER ADMIN PAGE ---
    story.append(Paragraph("E. Super Admin Portal Features (सुपर एडमिन के फीचर्स)", h2_style))
    story.append(Paragraph("Global Platform Owner ke liye top-level multi-school management system:", body_style))
    story.append(Paragraph("• <b>Multi-Tenant School Management:</b> Platform par new schools register karna, school details edit karna, activate/deactivate ya delete karna.", bullet_style))
    story.append(Paragraph("• <b>Platform SaaS Subscription Control:</b> Schools ke liye SaaS subscription pricing set karna, Razorpay/Offline payment collection, free period/trial grant karna.", bullet_style))
    story.append(Paragraph("• <b>Global Payment Audit Log:</b> System me hone wale har ek payment transaction ka centralized financial audit log (who paid, amount, school, timestamp, status).", bullet_style))
    story.append(Paragraph("• <b>User Role Delegation & Password Reset:</b> System-wide kisi bhi user ka role elevate/change karna, password reset, account deletion management.", bullet_style))
    story.append(Paragraph("• <b>Global System Broadcast:</b> All schools, admins, teachers aur students ko universal announcement or alert push notification bhejna.", bullet_style))
    story.append(Paragraph("• <b>Platform Analytics & Server Health:</b> Total schools, total students enrolled, active revenue, database diagnostics & performance metrics.", bullet_style))

    story.append(Spacer(1, 14))

    # ================= SUMMARY TABLE =================
    story.append(Paragraph("6. Summary Comparison Matrix (फीचर्स का संक्षिप्त विवरण)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=2, spaceAfter=8))

    matrix_data = [
        [Paragraph("Feature Module", table_header_style), Paragraph("Pending User", table_header_style), Paragraph("Student", table_header_style), Paragraph("Teacher", table_header_style), Paragraph("School Admin", table_header_style), Paragraph("Super Admin", table_header_style)],
        [Paragraph("Approval Status / Gate", table_cell_style), Paragraph("✓ View", table_cell_style), Paragraph("-", table_cell_style), Paragraph("-", table_cell_style), Paragraph("✓ Approve All", table_cell_style), Paragraph("✓ Master Control", table_cell_style)],
        [Paragraph("Attendance", table_cell_style), Paragraph("-", table_cell_style), Paragraph("✓ View Own", table_cell_style), Paragraph("✓ Mark Daily", table_cell_style), Paragraph("✓ Full Report", table_cell_style), Paragraph("✓ Global Analytics", table_cell_style)],
        [Paragraph("Fee / Subscription", table_cell_style), Paragraph("-", table_cell_style), Paragraph("✓ Pay Online/Offline", table_cell_style), Paragraph("✓ Salary View", table_cell_style), Paragraph("✓ Setup & Verify", table_cell_style), Paragraph("✓ SaaS Revenue", table_cell_style)],
        [Paragraph("Report Cards & Marks", table_cell_style), Paragraph("✓ Exam Test", table_cell_style), Paragraph("✓ Download PDF", table_cell_style), Paragraph("✓ Enter Marks", table_cell_style), Paragraph("✓ Generate Merit", table_cell_style), Paragraph("-", table_cell_style)],
        [Paragraph("Study Materials", table_cell_style), Paragraph("-", table_cell_style), Paragraph("✓ Download Notes", table_cell_style), Paragraph("✓ Upload PDF/Media", table_cell_style), Paragraph("✓ Monitor", table_cell_style), Paragraph("-", table_cell_style)],
        [Paragraph("Multi-School Management", table_cell_style), Paragraph("-", table_cell_style), Paragraph("-", table_cell_style), Paragraph("-", table_cell_style), Paragraph("✓ School Profile", table_cell_style), Paragraph("✓ Full Platform", table_cell_style)],
    ]
    t_matrix = Table(matrix_data, colWidths=[120, 70, 75, 75, 75, 72])
    t_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_matrix)

    story.append(Spacer(1, 20))
    story.append(Paragraph("<font color='#64748B' size=8.5>Document compiled automatically for TeachHub / YourSchool Platform. All URLs & features verified from live codebase and production deployment at https://yourschoolacademy.com/.</font>", ParagraphStyle('FootNote', parent=styles['Normal'], alignment=1)))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    target_path = os.path.join(os.getcwd(), "YourSchool_TeachHub_Technical_Doc.pdf")
    create_techhub_pdf(target_path)
