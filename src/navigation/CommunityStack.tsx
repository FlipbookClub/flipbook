import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CommunityHomeScreen } from "@/screens/community/CommunityHomeScreen";
import { ClubDetailScreen } from "@/screens/community/ClubDetailScreen";
import { CreateCommunityScreen } from "@/screens/community/CreateCommunityScreen";
import { InviteMembersScreen } from "@/screens/community/InviteMembersScreen";
import { JoinCommunityScreen } from "@/screens/community/JoinCommunityScreen";
import { InviteAcceptScreen } from "@/screens/community/InviteAcceptScreen";

import type { Id } from "../../convex/_generated/dataModel";

// Stack inside the Community tab so club navigation (detail, create, join,
// invite-accept) stays scoped to the tab. Pages added incrementally across
// TASK-026 → TASK-030.
export type CommunityStackParamList = {
  CommunityHome: undefined;
  CreateCommunity: undefined;
  InviteMembers: { clubId: Id<"clubs">; inviteCode: string };
  JoinCommunity: undefined;
  ClubDetail: { clubId: Id<"clubs"> };
  InviteAccept: { inviteCode: string };
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="CommunityHome" component={CommunityHomeScreen} />
      <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
      <Stack.Screen name="InviteMembers" component={InviteMembersScreen} />
      <Stack.Screen name="JoinCommunity" component={JoinCommunityScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
      <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />
    </Stack.Navigator>
  );
}
