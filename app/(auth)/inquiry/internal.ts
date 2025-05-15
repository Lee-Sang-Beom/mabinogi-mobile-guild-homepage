import { User } from "next-auth";
import { InquiryResponse } from "@/app/(auth)/inquiry/api";

export type InquiryStep = "INQUIRY_STEP_IN_PROGRESS" | "INQUIRY_STEP_RESOLVED";

export interface InquiryListProps {
  user: User;
}

export interface InquiryFormProps extends InquiryListProps {
  type: "CREATE" | "UPDATE";
  inquiryData: InquiryResponse | null;
}

export interface InquiryDetailProps extends InquiryListProps {
  inquiryData: InquiryResponse;
}
