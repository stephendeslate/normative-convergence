-- CreateTable payment_records
CREATE TABLE "payment_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointmentId" UUID NOT NULL,
    "stripePaymentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_records_appointmentId_key" ON "payment_records"("appointmentId");
CREATE UNIQUE INDEX "payment_records_stripePaymentId_key" ON "payment_records"("stripePaymentId");

-- Add video rooms and messaging tables
CREATE TABLE "video_rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointmentId" UUID NOT NULL,
    "roomName" TEXT NOT NULL,
    "status" "VideoRoomStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "video_rooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "video_rooms_appointmentId_key" ON "video_rooms"("appointmentId");
CREATE UNIQUE INDEX "video_rooms_roomName_key" ON "video_rooms"("roomName");
