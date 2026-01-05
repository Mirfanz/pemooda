import OrganizationMembers from "@/components/site/organization/members";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Anggota",
};

export default function Page() {
  return <OrganizationMembers />;
}
