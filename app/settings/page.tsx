import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import SettingsForm from "@/components/settings/SettingsForm";
import BackupCard from "@/components/settings/BackupCard";
import RestoreCard from "@/components/settings/RestoreCard";
import DangerZone from "@/components/settings/DangerZone";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageTitle title="系统设置" subtitle="手续费、快捷数量、备份与数据管理" />

      <div className="space-y-5">
        <SettingsForm />
        <BackupCard />
        <RestoreCard />
        <DangerZone />
      </div>
    </PageContainer>
  );
}