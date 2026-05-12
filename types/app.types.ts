import type { BarnRole } from "./roles";

export type UUID = string;

export type Profile = {
  id: UUID;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
};

export type Barn = {
  id: UUID;
  name: string;
  slug: string;
  address: string | null;
  timezone: string;
  stripe_account_id: string | null;
  owner_id: UUID | null;
  created_at: string;
};

export type BarnMembership = {
  id: UUID;
  barn_id: UUID;
  user_id: UUID;
  roles: BarnRole[];
  is_active: boolean;
  joined_at: string;
};

export type TaskStatus = "pending" | "in_progress" | "done" | "delayed" | "issue";
export type TaskPriority = "normal" | "high" | "urgent";

export type Task = {
  id: UUID;
  barn_id: UUID;
  horse_id: UUID | null;
  assigned_to: UUID | null;
  created_by: UUID;
  title: string;
  notes: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  completed_at: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_at: string;
};

export type Horse = {
  id: UUID;
  barn_id: UUID;
  name: string;
  breed: string | null;
  age: number | null;
  stall: string | null;
  photo_url: string | null;
  feeding_notes: string | null;
  medication_notes: string | null;
  equipment_notes: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  farrier_name: string | null;
  farrier_phone: string | null;
  owner_id: UUID | null;
  is_active: boolean;
  created_at: string;
};

export type LessonStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled_client"
  | "cancelled_trainer"
  | "no_show";

export type Lesson = {
  id: UUID;
  barn_id: UUID;
  lesson_type_id: UUID | null;
  trainer_id: UUID | null;
  horse_id: UUID | null;
  client_id: UUID | null;
  status: LessonStatus;
  starts_at: string;
  ends_at: string;
  location: string | null;
  notes: string | null;
  level: string | null;
  discipline: string | null;
  is_paid: boolean;
  payment_id: UUID | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
};

export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded";

export type Payment = {
  id: UUID;
  barn_id: UUID;
  payer_id: UUID | null;
  recipient_id: UUID | null;
  lesson_id: UUID | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  tax_rate_percent: number | null;
  tax_amount_cents: number;
  is_prepayment: boolean;
  paid_at: string | null;
  created_at: string;
};
