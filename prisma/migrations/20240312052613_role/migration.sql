-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "read_permission" BOOLEAN NOT NULL,
    "write_permission" BOOLEAN NOT NULL,
    "update_permission" BOOLEAN NOT NULL,
    "delete_permission" BOOLEAN NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "father_name" VARCHAR(255) NOT NULL,
    "mother_name" VARCHAR(255) NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "profile_picture" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "gender" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "marital_status" BOOLEAN NOT NULL,
    "qualification" TEXT NOT NULL,
    "work_experience" TEXT NOT NULL,
    "address_id" INTEGER NOT NULL,
    "bank_details_id" INTEGER,
    "social_media_links" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "designation_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "salary" INTEGER NOT NULL,
    "deduction" INTEGER NOT NULL,
    "contract_type" TEXT NOT NULL,
    "DOJ" TIMESTAMP(3) NOT NULL,
    "DOL" TIMESTAMP(3),
    "work_shift" TEXT NOT NULL,
    "work_location" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" SERIAL NOT NULL,
    "designation" TEXT NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "admission_no" INTEGER NOT NULL,
    "student_session_id" INTEGER NOT NULL,
    "roll_no" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "class_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "religion" TEXT NOT NULL,
    "caste" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "blood_group" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "medical_history" TEXT NOT NULL,
    "aadhar_card" TEXT NOT NULL,
    "admission_date" TIMESTAMP(3) NOT NULL,
    "profile_picture" TEXT NOT NULL,
    "other_docs" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address_id" INTEGER NOT NULL,
    "parent_details_id" INTEGER NOT NULL,
    "bank_details_id" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "result" TEXT NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "semester" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "session_id" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "session" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "class_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "section" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentDetails" (
    "id" SERIAL NOT NULL,
    "relation_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "ParentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "address_type" TEXT NOT NULL,
    "house_no" TEXT NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "bank_name" TEXT NOT NULL,
    "pan_number" TEXT,
    "ifsc" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "account_no" TEXT NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveTypes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LeaveTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaves" (
    "id" SERIAL NOT NULL,
    "leave_type_id" INTEGER NOT NULL,
    "apply_date" TIMESTAMP(3) NOT NULL,
    "from_date" TIMESTAMP(3) NOT NULL,
    "to_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "attachment" TEXT,

    CONSTRAINT "Leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "notice_date" TIMESTAMP(3) NOT NULL,
    "publish_on" TIMESTAMP(3) NOT NULL,
    "message_to" TEXT[],
    "message" TEXT NOT NULL,
    "attachment" TEXT,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" SERIAL NOT NULL,
    "income_head_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "invoice_number" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "attached_doc" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeHead" (
    "id" SERIAL NOT NULL,
    "income_head" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "IncomeHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "expense_head_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "invoice_number" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "attached_doc" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseHead" (
    "id" SERIAL NOT NULL,
    "expense_head" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ExpenseHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "attendance" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "earning" DOUBLE PRECISION NOT NULL,
    "deduction" DOUBLE PRECISION NOT NULL,
    "net_amount" DOUBLE PRECISION NOT NULL,
    "is_staff_loan" BOOLEAN NOT NULL,
    "loan_deduction_amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeesPayment" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "fees_master_id" INTEGER NOT NULL,
    "dos" TIMESTAMP(3) NOT NULL,
    "approved_or_rejected_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_from" TEXT NOT NULL,
    "payment_mode" TEXT NOT NULL,
    "payment_proof" TEXT NOT NULL,
    "comment" TEXT,

    CONSTRAINT "FeesPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeesType" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "extra_fees_type" TEXT NOT NULL,
    "extra_amount" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeesType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeesMaster" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "fees_type_id" INTEGER NOT NULL,
    "fine_name" TEXT NOT NULL,
    "fine_amount" DOUBLE PRECISION NOT NULL,
    "discount_name" TEXT NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "net_amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FeesMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffLoan" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "loan_amount" DOUBLE PRECISION NOT NULL,
    "no_of_installments" INTEGER NOT NULL,
    "installment_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "action_by" INTEGER NOT NULL,

    CONSTRAINT "StaffLoan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_id_key" ON "User"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_bank_details_id_key" ON "User"("bank_details_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_staff_id_key" ON "Employee"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admission_no_key" ON "Student"("admission_no");

-- CreateIndex
CREATE UNIQUE INDEX "Student_address_id_key" ON "Student"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_bank_details_id_key" ON "Student"("bank_details_id");

-- CreateIndex
CREATE UNIQUE INDEX "Result_student_id_key" ON "Result"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Result_course_id_key" ON "Result"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Result_semester_id_key" ON "Result"("semester_id");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bank_details_id_fkey" FOREIGN KEY ("bank_details_id") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "Designation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_student_session_id_fkey" FOREIGN KEY ("student_session_id") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_parent_details_id_fkey" FOREIGN KEY ("parent_details_id") REFERENCES "ParentDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_bank_details_id_fkey" FOREIGN KEY ("bank_details_id") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaves" ADD CONSTRAINT "Leaves_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "LeaveTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_income_head_id_fkey" FOREIGN KEY ("income_head_id") REFERENCES "IncomeHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_expense_head_id_fkey" FOREIGN KEY ("expense_head_id") REFERENCES "ExpenseHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeesPayment" ADD CONSTRAINT "FeesPayment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeesPayment" ADD CONSTRAINT "FeesPayment_fees_master_id_fkey" FOREIGN KEY ("fees_master_id") REFERENCES "FeesMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeesType" ADD CONSTRAINT "FeesType_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeesMaster" ADD CONSTRAINT "FeesMaster_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeesMaster" ADD CONSTRAINT "FeesMaster_fees_type_id_fkey" FOREIGN KEY ("fees_type_id") REFERENCES "FeesType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffLoan" ADD CONSTRAINT "StaffLoan_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
