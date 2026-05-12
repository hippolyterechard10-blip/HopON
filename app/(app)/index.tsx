import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import { ClientHome } from "@/components/home/ClientHome";
import { GroomHome } from "@/components/home/GroomHome";
import { OwnerHome } from "@/components/home/OwnerHome";
import { OwnerTrainerHome } from "@/components/home/OwnerTrainerHome";
import { TrainerHome } from "@/components/home/TrainerHome";
import { useRole } from "@/hooks/useRole";
import { colors } from "@/constants/colors";

export default function Home() {
  const { homeVariant } = useRole();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {renderVariant(homeVariant)}
    </SafeAreaView>
  );
}

function renderVariant(v: ReturnType<typeof useRole>["homeVariant"]) {
  switch (v) {
    case "owner":
      return <OwnerHome />;
    case "trainer":
      return <TrainerHome />;
    case "owner_trainer":
      return <OwnerTrainerHome />;
    case "groom":
      return <GroomHome />;
    case "client":
      return <ClientHome />;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
});
