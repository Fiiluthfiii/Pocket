-- CreateTable
CREATE TABLE "SavingTransaction" (
    "id" TEXT NOT NULL,
    "savingGoalId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavingTransaction_savingGoalId_idx" ON "SavingTransaction"("savingGoalId");

-- CreateIndex
CREATE INDEX "SavingTransaction_walletId_idx" ON "SavingTransaction"("walletId");

-- CreateIndex
CREATE INDEX "SavingTransaction_date_idx" ON "SavingTransaction"("date");

-- AddForeignKey
ALTER TABLE "SavingTransaction" ADD CONSTRAINT "SavingTransaction_savingGoalId_fkey" FOREIGN KEY ("savingGoalId") REFERENCES "SavingGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingTransaction" ADD CONSTRAINT "SavingTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add walletId to SavingGoal
ALTER TABLE "SavingGoal" ADD COLUMN "walletId" TEXT;

-- CreateIndex
CREATE INDEX "SavingGoal_walletId_idx" ON "SavingGoal"("walletId");

-- AddForeignKey
ALTER TABLE "SavingGoal" ADD CONSTRAINT "SavingGoal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
